"""Calex Backend — FastAPI server with real integrations."""

import os
import re
import asyncio
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Load .env from project root (one level up from backend/)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import db
from models import (
    Company, AgentIdentity, KnowledgeSource, ConversationLog,
    ActivityFeedItem, BrowserRun,
    OnboardRequest, OnboardResponse,
    WidgetAskRequest, WidgetAnswerResponse, WidgetShowResponse,
    CommunityEventRequest, CommunityEventResponse,
    new_id, now_iso,
)
from services import supermemory_client, agentmail_client, browser_use_client, vapi_client, minimax_tts, llm
from services import composio_client
from services import discord_webhook
from services.discord_bot import start_bot, stop_bot


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("""
╔══════════════════════════════════════════════════════╗
║                  Calex Backend                       ║
╠══════════════════════════════════════════════════════╣
║  POST /api/onboard            — onboard company      ║
║  POST /api/widget/ask         — answer / show me     ║
║  GET  /api/activity           — activity feed        ║
║  GET  /api/browser/run        — browser run log      ║
║  POST /api/demo/community_event — demo trigger       ║
║  GET  /api/health             — health check         ║
╚══════════════════════════════════════════════════════╝
    """)
    # Start Discord bot in background
    bot_task = asyncio.create_task(start_bot())
    yield
    # Shutdown
    await stop_bot()
    bot_task.cancel()


app = FastAPI(title="Calex API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Helpers ─────────────────────────────────────────────────────────────────

def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def emit_activity(company_id: str, type: str, title: str, detail: str = "",
                  status: str = "success", session_id: str | None = None):
    item = ActivityFeedItem(
        company_id=company_id,
        type=type,
        title=title,
        detail=detail,
        status=status,
        session_id=session_id,
    )
    db.insert("activity_feed", item)
    return item


# ─── Health ──────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "supermemory": bool(os.environ.get("SUPERMEMORY_API_KEY")),
        "agentmail": bool(os.environ.get("AGENT_MAIL_API")),
        "browser_use": bool(os.environ.get("BROWSER_USE_API_KEY")),
        "vapi": bool(os.environ.get("VAPI_API_KEY")),
        "minimax": bool(os.environ.get("MINI_MAX_API_KEY")),
        "openai": bool(os.environ.get("OPENAI_API_KEY")),
        "discord_bot": bool(os.environ.get("DISCORD_BOT_TOKEN")),
        "discord_webhook": bool(os.environ.get("DISCORD_WEBHOOK_URL")),
        "composio": bool(os.environ.get("COMPOSIO_API_KEY")),
    }


# ─── POST /api/onboard ──────────────────────────────────────────────────────

@app.post("/api/onboard", response_model=OnboardResponse)
async def onboard(req: OnboardRequest, background_tasks: BackgroundTasks):
    slug = slugify(req.company_name)
    company = Company(
        slug=slug,
        name=req.company_name,
        website_url=req.website_url,
        docs_urls=req.docs_urls,
        tone=req.tone,
        founder_email=req.founder_email,
        demo_mode=req.demo_mode,
    )
    db.insert("companies", company)

    emit_activity(company.company_id, "onboarding_started",
                  "Onboarding started", f"Setting up Calex for {req.company_name}")

    # ── AgentMail: create inbox ──
    agentmail_address = ""
    try:
        agentmail_address = await agentmail_client.create_inbox(req.agent_name)
    except Exception as e:
        print(f"[Onboard] AgentMail failed: {e}")
        agentmail_address = f"{slug}-agent@agentmail.to"

    # ── Vapi: create assistant + phone number ──
    vapi_assistant_id = ""
    vapi_phone = ""
    vapi_phone_id = ""
    try:
        system_prompt = f"""You are {req.agent_name}, the AI Developer Relations agent for {req.company_name}.
You help developers with questions about {req.company_name}'s products and services.
Your tone is {req.tone}. Be helpful, concise, and accurate.
If you don't know the answer, say so honestly and offer to escalate to the team.
Website: {req.website_url}"""

        assistant = await vapi_client.create_assistant(
            agent_name=req.agent_name,
            company_name=req.company_name,
            system_prompt=system_prompt,
        )
        vapi_assistant_id = assistant["id"]

        phone = await vapi_client.create_phone_number(vapi_assistant_id)
        vapi_phone = phone["number"]
        vapi_phone_id = phone["id"]
    except Exception as e:
        print(f"[Onboard] Vapi failed: {e}")
        vapi_phone = "+1 (demo mode)"

    # ── Save agent identity ──
    agent = AgentIdentity(
        company_id=company.company_id,
        agent_name=req.agent_name,
        agentmail_address=agentmail_address,
        vapi_assistant_id=vapi_assistant_id,
        vapi_phone_number=vapi_phone,
        vapi_phone_number_id=vapi_phone_id,
    )
    db.insert("agent_identities", agent)

    emit_activity(company.company_id, "identity_created",
                  "Agent identity created",
                  f"Email: {agentmail_address} | Phone: {vapi_phone}")

    # ── Background: crawl website + build memory ──
    background_tasks.add_task(
        _crawl_and_ingest, company.company_id, req.website_url, req.docs_urls
    )

    return OnboardResponse(
        company_id=company.company_id,
        slug=slug,
        agentmail_address=agentmail_address,
        vapi_phone_number=vapi_phone,
        demo_mode=req.demo_mode,
    )


async def _crawl_and_ingest(company_id: str, website_url: str, docs_urls: list[str]):
    """Background task: crawl website, ingest into Supermemory."""
    emit_activity(company_id, "crawling", "Crawling website", website_url, status="pending")

    all_urls = [website_url] + docs_urls
    all_chunks = []

    for url in all_urls:
        ks = KnowledgeSource(company_id=company_id, url=url, status="crawling")
        db.insert("knowledge_sources", ks)

        try:
            chunks = await browser_use_client.scrape_website(url)
            all_chunks.extend(chunks)
            db.update_by_field("knowledge_sources", KnowledgeSource,
                               "url", url, {"status": "done", "last_crawled_at": now_iso()})
        except Exception as e:
            print(f"[Crawl] Failed for {url}: {e}")
            db.update_by_field("knowledge_sources", KnowledgeSource,
                               "url", url, {"status": "failed"})
            # Fallback: add the URL itself as minimal context
            all_chunks.append(f"Company website: {url}")

    if all_chunks:
        try:
            await supermemory_client.bulk_add_memory(all_chunks, company_id, source="website")
            emit_activity(company_id, "memory_built", "Knowledge memory built",
                          f"Ingested {len(all_chunks)} knowledge chunks")
        except Exception as e:
            print(f"[Crawl] Supermemory ingest failed: {e}")
            emit_activity(company_id, "memory_built", "Memory build failed",
                          str(e), status="error")

    emit_activity(company_id, "setup_complete", "Setup complete",
                  "Calex is ready to answer questions")


# ─── POST /api/widget/ask ───────────────────────────────────────────────────

@app.post("/api/widget/ask")
async def widget_ask(req: WidgetAskRequest, background_tasks: BackgroundTasks):
    company = db.get_by_field("companies", Company, "company_id", req.company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    # Retrieve context from Supermemory
    results = await supermemory_client.search_memory(req.question, req.company_id)
    context = supermemory_client.format_context(results)

    # Generate answer with LLM
    llm_result = await llm.generate_answer(
        question=req.question,
        context=context,
        company_name=company.name,
        tone=company.tone,
        requested_mode=req.requested_mode,
    )

    # Check for escalation
    if llm_result["escalation"]:
        agent = db.get_by_field("agent_identities", AgentIdentity, "company_id", req.company_id)
        if agent and company.founder_email:
            try:
                await agentmail_client.send_escalation(
                    from_inbox=agent.agentmail_address,
                    founder_email=company.founder_email,
                    question=req.question,
                    draft_answer=llm_result["answer_text"],
                    confidence=llm_result["confidence"],
                )
            except Exception as e:
                print(f"[Escalation] Email failed: {e}")
        emit_activity(req.company_id, "escalated", "Escalated to founder",
                      req.question, status="pending")

    # Log conversation
    conv = ConversationLog(
        company_id=req.company_id,
        platform="widget",
        question=req.question,
        answer=llm_result["answer_text"],
        confidence=llm_result["confidence"],
        mode=req.requested_mode,
        escalated=llm_result["escalation"],
    )
    db.insert("conversation_logs", conv)

    # Store useful Q&A back into memory
    if llm_result["confidence"] >= 0.7 and not llm_result["escalation"]:
        try:
            await supermemory_client.add_memory(
                content=f"Q: {req.question}\nA: {llm_result['answer_text']}",
                company_id=req.company_id,
                metadata={"source": "learned_qa"},
            )
        except Exception:
            pass

    # ── ANSWER MODE ──
    if req.requested_mode == "answer" and not llm_result["should_show"]:
        emit_activity(req.company_id, "widget_answered", "Widget answered question",
                      req.question[:100])
        return WidgetAnswerResponse(
            answer_text=llm_result["answer_text"],
            confidence=llm_result["confidence"],
            suggested_links=llm_result["suggested_links"],
        )

    # ── SHOW MODE ──
    session_id = new_id()

    # Create browser run record
    browser_run = BrowserRun(
        company_id=req.company_id,
        session_id=session_id,
        purpose=f"Guided walkthrough: {req.question[:80]}",
        status="running",
        run_log=[f"[{now_iso()}] Starting walkthrough for: {req.question}"],
    )
    db.insert("browser_runs", browser_run)

    # Generate narration audio with MiniMax
    narration_audio_url = None
    if llm_result["narration_script"]:
        try:
            tts_result = await minimax_tts.generate_speech(
                llm_result["narration_script"], output_format="url"
            )
            narration_audio_url = tts_result.get("audio_url")
        except Exception as e:
            print(f"[TTS] MiniMax failed: {e}")

    # Run browser walkthrough in background
    background_tasks.add_task(
        _run_walkthrough, req.company_id, session_id, company.website_url, req.question
    )

    emit_activity(req.company_id, "walkthrough_executed",
                  "Guided walkthrough started", req.question[:100],
                  status="pending", session_id=session_id)

    return WidgetShowResponse(
        answer_text=llm_result["answer_text"],
        steps=llm_result["steps"],
        final_url=company.website_url,
        session_id=session_id,
        narration_script=llm_result["narration_script"],
        narration_audio_url=narration_audio_url,
    )


async def _run_walkthrough(company_id: str, session_id: str, website_url: str, question: str):
    """Background task: run Browser Use walkthrough and update the BrowserRun record."""
    try:
        result = await browser_use_client.run_walkthrough(website_url, question)
        db.update_by_field("browser_runs", BrowserRun, "session_id", session_id, {
            "status": "completed",
            "run_log": result["run_log"],
            "final_url": result["final_url"],
        })
        emit_activity(company_id, "walkthrough_executed",
                      "Walkthrough completed", question[:100], session_id=session_id)
    except Exception as e:
        print(f"[Walkthrough] Failed: {e}")
        db.update_by_field("browser_runs", BrowserRun, "session_id", session_id, {
            "status": "failed",
            "run_log": [f"Error: {e}"],
        })


# ─── GET /api/activity ───────────────────────────────────────────────────────

@app.get("/api/activity")
async def get_activity(company_id: str):
    items = db.get_many_by_field("activity_feed", ActivityFeedItem, "company_id", company_id)
    items.sort(key=lambda x: x.ts, reverse=True)
    return items


# ─── GET /api/browser/run ────────────────────────────────────────────────────

@app.get("/api/browser/run")
async def get_browser_run(session_id: str):
    run = db.get_by_field("browser_runs", BrowserRun, "session_id", session_id)
    if not run:
        raise HTTPException(404, "Browser run not found")
    return run


# ─── POST /api/demo/community_event ─────────────────────────────────────────

@app.post("/api/demo/community_event", response_model=CommunityEventResponse)
async def demo_community_event(req: CommunityEventRequest):
    company = db.get_by_field("companies", Company, "company_id", req.company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    emit_activity(req.company_id, "community_question",
                  f"Question in #{req.channel} ({req.platform})",
                  req.message_text[:100], status="pending")

    # Retrieve context from Supermemory
    results = await supermemory_client.search_memory(req.message_text, req.company_id)
    context = supermemory_client.format_context(results)

    # Generate community response
    llm_result = await llm.generate_community_response(
        message=req.message_text,
        context=context,
        company_name=company.name,
        tone=company.tone,
    )

    # Log conversation
    conv = ConversationLog(
        company_id=req.company_id,
        platform=req.platform,
        channel=req.channel,
        user_id=req.user_id,
        question=req.message_text,
        answer=llm_result["answer_text"],
        confidence=llm_result["confidence"],
        mode="answer",
        escalated=llm_result["escalation"],
    )
    db.insert("conversation_logs", conv)

    # Escalate or respond
    if llm_result["escalation"] or llm_result["confidence"] < 0.75:
        agent = db.get_by_field("agent_identities", AgentIdentity, "company_id", req.company_id)
        if agent and company.founder_email:
            try:
                await agentmail_client.send_escalation(
                    from_inbox=agent.agentmail_address,
                    founder_email=company.founder_email,
                    question=req.message_text,
                    draft_answer=llm_result["answer_text"],
                    confidence=llm_result["confidence"],
                    platform=req.platform,
                )
            except Exception as e:
                print(f"[Escalation] Email failed: {e}")
        emit_activity(req.company_id, "escalated",
                      "Escalated to founder",
                      f"{req.platform}/#{req.channel}: {req.message_text[:80]}")
        return CommunityEventResponse(
            status="escalated",
            answer_text=llm_result["answer_text"],
            escalated=True,
        )

    # Store learned Q&A
    try:
        await supermemory_client.add_memory(
            content=f"Q: {req.message_text}\nA: {llm_result['answer_text']}",
            company_id=req.company_id,
            metadata={"source": "community_learned", "platform": req.platform},
        )
    except Exception:
        pass

    # Post answer to Discord via webhook if platform is discord
    if req.platform == "discord":
        try:
            await discord_webhook.post_message(
                content=f"**Q:** {req.message_text}\n\n**Calex:** {llm_result['answer_text']}",
                username=f"Calex ({company.name})",
            )
        except Exception as e:
            print(f"[Discord Webhook] Post failed: {e}")

    emit_activity(req.company_id, "community_answered",
                  f"Answered in #{req.channel} ({req.platform})",
                  llm_result["answer_text"][:100])

    return CommunityEventResponse(
        status="ok",
        answer_text=llm_result["answer_text"],
        escalated=False,
    )


# ─── GET /api/company ────────────────────────────────────────────────────────

@app.get("/api/company")
async def get_company(company_id: str | None = None, slug: str | None = None):
    if company_id:
        company = db.get_by_field("companies", Company, "company_id", company_id)
    elif slug:
        company = db.get_by_field("companies", Company, "slug", slug)
    else:
        raise HTTPException(400, "Provide company_id or slug")
    if not company:
        raise HTTPException(404, "Company not found")

    agent = db.get_by_field("agent_identities", AgentIdentity, "company_id", company.company_id)

    return {
        "company": company.model_dump(),
        "agent": agent.model_dump() if agent else None,
    }


# ─── Composio Endpoints ──────────────────────────────────────────────────────

@app.post("/api/composio/authorize")
async def composio_authorize(toolkit: str, company_id: str, callback_url: str = ""):
    """Start OAuth flow for a Composio toolkit (gmail, github, slack, etc.)."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    result = await composio_client.authorize_toolkit(
        user_id=company_id,
        toolkit=toolkit,
        callback_url=callback_url,
    )
    if "error" in result:
        raise HTTPException(500, result["error"])

    emit_activity(company_id, "composio_auth",
                  f"Started {toolkit} authorization",
                  result.get("redirect_url", ""))

    return {
        "toolkit": toolkit,
        "redirect_url": result.get("redirect_url"),
    }


@app.get("/api/composio/toolkits")
async def composio_toolkits(company_id: str):
    """Check which Composio toolkits are connected for a company."""
    return await composio_client.check_toolkits(user_id=company_id)


# ─── Run ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
