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
from services import llms_txt_crawler
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

    # ── Check if company already exists (reuse for demo) ──
    existing = db.get_by_field("companies", Company, "slug", slug)
    if existing:
        agent = db.get_by_field("agent_identities", AgentIdentity, "company_id", existing.company_id)
        print(f"[Onboard] Reusing existing company: {existing.company_id} ({slug})")
        return OnboardResponse(
            company_id=existing.company_id,
            slug=slug,
            agentmail_address=agent.agentmail_address if agent else "",
            vapi_phone_number=agent.vapi_phone_number if agent else "",
            demo_mode=existing.demo_mode,
        )

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
    """Background task: crawl website + llms.txt, ingest into Supermemory."""
    emit_activity(company_id, "crawling", "Crawling website & docs", website_url, status="pending")

    all_urls = [website_url] + docs_urls
    all_chunks = []

    # Phase 1: Try llms.txt first (fast, reliable, AI-optimized content)
    try:
        llms_result = await llms_txt_crawler.crawl_and_index(website_url, company_id, max_pages=30)
        if llms_result["found"]:
            emit_activity(company_id, "crawling", "Indexed llms.txt",
                          f"Found {llms_result['urls_found']} URLs, indexed {llms_result['pages_indexed']} pages ({llms_result['chunks_indexed']} chunks)")
            print(f"[Crawl] llms.txt indexed: {llms_result}")
        else:
            print(f"[Crawl] No llms.txt found for {website_url}")
    except Exception as e:
        print(f"[Crawl] llms.txt crawl failed: {e}")

    # Phase 2: Also try llms.txt for each doc URL domain (in case they have separate docs sites)
    doc_domains_tried = set()
    for doc_url in docs_urls:
        from urllib.parse import urlparse
        parsed = urlparse(doc_url)
        domain_root = f"{parsed.scheme}://{parsed.netloc}"
        if domain_root not in doc_domains_tried and domain_root != website_url.rstrip("/"):
            doc_domains_tried.add(domain_root)
            try:
                doc_llms = await llms_txt_crawler.crawl_and_index(domain_root, company_id, max_pages=20)
                if doc_llms["found"]:
                    emit_activity(company_id, "crawling", f"Indexed docs llms.txt",
                                  f"{domain_root}: {doc_llms['pages_indexed']} pages ({doc_llms['chunks_indexed']} chunks)")
            except Exception as e:
                print(f"[Crawl] Docs llms.txt failed for {domain_root}: {e}")

    # Phase 3: Browser-based scraping for each URL
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
                          f"Ingested {len(all_chunks)} knowledge chunks from browser scraping")
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

    # Include known doc page URLs so LLM can reference specific pages
    if company.doc_page_urls:
        context += f"\n\nAll known documentation page URLs for {company.name} (use the most relevant ones in suggested_links):\n"
        context += "\n".join([f"- {u}" for u in company.doc_page_urls])
    elif company.docs_urls:
        context += f"\n\nDocs sites: {', '.join(company.docs_urls)}"
    context += f"\nMain website: {company.website_url}"

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
        final_url=llm_result["suggested_links"][0] if llm_result["suggested_links"] else company.website_url,
        session_id=session_id,
        narration_script=llm_result["narration_script"],
        narration_audio_url=narration_audio_url,
        suggested_links=llm_result["suggested_links"],
        navigation_goal=llm_result["navigation_goal"],
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


# ─── POST /api/crawl/llms-txt ─────────────────────────────────────────────────

@app.post("/api/crawl/llms-txt")
async def crawl_llms_txt(company_id: str, url: str, max_pages: int = 30):
    """Manually trigger llms.txt crawling for a company."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    emit_activity(company_id, "crawling", "Starting llms.txt crawl", url, status="pending")

    result = await llms_txt_crawler.crawl_and_index(url, company_id, max_pages=max_pages)

    if result["found"]:
        emit_activity(company_id, "memory_built", "llms.txt knowledge indexed",
                      f"{result['pages_indexed']} pages, {result['chunks_indexed']} chunks")
    else:
        emit_activity(company_id, "crawling", "No llms.txt found", url, status="error")

    return result


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


# ─── LinkedIn Posting ─────────────────────────────────────────────────────────

@app.post("/api/linkedin/generate")
async def linkedin_generate(company_id: str, topic_hint: str = ""):
    """Generate a LinkedIn post from recent community activity."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    # Gather recent activity as context
    activity = db.get_all("activity_feed", ActivityFeedItem)
    company_activity = [a for a in activity if a.company_id == company_id]
    recent = company_activity[:20]

    activity_text = "\n".join([
        f"- [{a.type}] {a.title}: {a.detail}" for a in recent
    ]) or "No recent activity — generate a general DevRel post about the company."

    # Also pull recent conversation logs
    convos = db.get_all("conversation_logs", ConversationLog)
    company_convos = [c for c in convos if c.company_id == company_id][:10]
    convo_text = "\n".join([
        f"- Q: {c.question}\n  A: {c.answer}" for c in company_convos
    ])

    full_context = f"Activity:\n{activity_text}\n\nRecent Q&A:\n{convo_text}"

    result = await llm.generate_linkedin_post(
        company_name=company.name,
        recent_activity=full_context,
        tone=company.tone,
        topic_hint=topic_hint,
    )

    return {
        "post_text": result["post_text"],
        "hashtags": result["hashtags"],
    }


@app.post("/api/linkedin/post")
async def linkedin_post(company_id: str, post_text: str):
    """Post to LinkedIn via Composio (requires LinkedIn authorization)."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    result = await composio_client.execute_linkedin_post(
        user_id=company_id,
        post_text=post_text,
    )

    if "error" in result:
        raise HTTPException(500, result["error"])

    emit_activity(company_id, "linkedin_posted",
                  "Posted to LinkedIn",
                  post_text[:100])

    return result


# ─── Leads Intelligence ──────────────────────────────────────────────────────

@app.post("/api/leads/extract")
async def extract_leads(company_id: str):
    """Analyze recent conversations to extract potential developer leads."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    # Gather recent conversations
    convos = db.get_many_by_field("conversation_logs", ConversationLog, "company_id", company_id)
    convos.sort(key=lambda x: getattr(x, "ts", ""), reverse=True)
    recent = convos[:20]

    convo_text = "\n".join([
        f"- [{c.platform}] User {getattr(c, 'user_id', 'anon')}: {c.question}\n  Agent: {c.answer}"
        for c in recent
    ])

    if not convo_text.strip():
        return {"leads": [], "summary": "No recent conversations to analyze."}

    result = await llm.extract_leads(convo_text, company.name)

    emit_activity(company_id, "leads_extracted",
                  "Lead intelligence updated",
                  f"Found {len(result['leads'])} potential leads")

    return result


@app.post("/api/calendar/schedule")
async def schedule_meeting(
    company_id: str,
    title: str,
    description: str = "",
    start_datetime: str = "",
    end_datetime: str = "",
    attendee_email: str = "",
):
    """Schedule a Google Calendar meeting via Composio."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    # Default: schedule 30 min from now if no time given
    if not start_datetime:
        from datetime import datetime, timedelta
        start = datetime.utcnow() + timedelta(hours=24)
        start_datetime = start.isoformat() + "Z"
        end_datetime = (start + timedelta(minutes=30)).isoformat() + "Z"
    elif not end_datetime:
        from datetime import datetime, timedelta
        start = datetime.fromisoformat(start_datetime.replace("Z", ""))
        end_datetime = (start + timedelta(minutes=30)).isoformat() + "Z"

    result = await composio_client.create_calendar_event(
        user_id=company_id,
        title=title,
        description=description,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        attendee_email=attendee_email,
    )

    if "error" in result:
        raise HTTPException(500, result["error"])

    emit_activity(company_id, "calendar_scheduled",
                  "Meeting scheduled",
                  f"{title} — {attendee_email or 'no attendee'}")

    return result


@app.post("/api/sheets/log-lead")
async def log_lead_to_sheet(
    company_id: str,
    spreadsheet_id: str,
    lead_name: str,
    interest: str,
    score: int = 0,
    suggested_action: str = "",
):
    """Log a lead to Google Sheets via Composio."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    values = [
        now_iso(),
        lead_name,
        interest,
        str(score),
        suggested_action,
        company.name,
    ]

    result = await composio_client.append_sheet_row(
        user_id=company_id,
        spreadsheet_id=spreadsheet_id,
        values=values,
    )

    if "error" in result:
        raise HTTPException(500, result["error"])

    emit_activity(company_id, "sheet_updated",
                  "Lead logged to Google Sheets",
                  f"{lead_name} (score: {score})")

    return result


# ─── Slack → LinkedIn Pipeline ───────────────────────────────────────────────

@app.post("/api/slack/fetch")
async def fetch_slack_messages(company_id: str, channel: str = "all-calexai", limit: int = 20):
    """Fetch recent messages from a Slack channel via Composio."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    result = await composio_client.fetch_slack_messages(
        user_id=company_id,
        channel_name=channel,
        limit=limit,
    )

    if "error" in result:
        raise HTTPException(500, result["error"])

    emit_activity(company_id, "slack_fetched",
                  f"Fetched Slack #{channel}",
                  f"{len(result.get('messages', []))} messages")

    return result


@app.post("/api/slack/generate-linkedin")
async def slack_to_linkedin(company_id: str, channel: str = "all-calexai"):
    """Fetch Slack messages and auto-generate a LinkedIn post from them."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    # Step 1: Fetch Slack messages
    slack_result = await composio_client.fetch_slack_messages(
        user_id=company_id,
        channel_name=channel,
        limit=25,
    )

    messages = slack_result.get("messages", [])
    if not messages:
        return {"post_text": "", "hashtags": [], "slack_messages": 0,
                "error": "No Slack messages found. Connect Slack via Composio first."}

    # Step 2: Format messages as context
    slack_text = "\n".join([
        f"- {msg.get('user', 'someone')}: {msg.get('text', '')}"
        for msg in messages if msg.get("text")
    ])

    # Step 3: Generate LinkedIn post using LLM
    full_context = f"Slack conversations from #{channel}:\n{slack_text}"
    result = await llm.generate_linkedin_post(
        company_name=company.name,
        recent_activity=full_context,
        tone=company.tone,
        topic_hint=f"Based on real Slack discussions in #{channel}",
    )

    emit_activity(company_id, "slack_linkedin_generated",
                  "LinkedIn post generated from Slack",
                  result.get("post_text", "")[:100])

    return {
        "post_text": result.get("post_text", ""),
        "hashtags": result.get("hashtags", []),
        "slack_messages": len(messages),
    }


# ─── AgentMail Endpoints ────────────────────────────────────────────────────

@app.get("/api/agentmail/inbox")
async def get_agentmail_inbox(company_id: str):
    """Get the AgentMail inbox for this company's agent."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    agent = db.get_by_field("agent_identities", AgentIdentity, "company_id", company_id)
    if not agent or not agent.agentmail_address:
        return {"inbox": None, "messages": []}

    try:
        client = agentmail_client.get_client()
        inbox_id = agent.agentmail_address
        messages_resp = client.inboxes.messages.list(inbox_id=inbox_id)
        messages = []
        for msg in getattr(messages_resp, "messages", []) or []:
            messages.append({
                "id": getattr(msg, "id", "") or getattr(msg, "message_id", ""),
                "from": getattr(msg, "from_", "") or getattr(msg, "sender", ""),
                "to": getattr(msg, "to", ""),
                "subject": getattr(msg, "subject", ""),
                "text": getattr(msg, "text", "") or getattr(msg, "body", ""),
                "date": getattr(msg, "date", "") or getattr(msg, "created_at", ""),
                "direction": "inbound" if getattr(msg, "from_", "") != inbox_id else "outbound",
            })
        return {"inbox": inbox_id, "messages": messages}
    except Exception as e:
        print(f"[AgentMail] Inbox fetch error: {e}")
        return {"inbox": agent.agentmail_address, "messages": [], "error": str(e)}


@app.post("/api/agentmail/send")
async def send_agentmail(
    company_id: str,
    to: str,
    subject: str,
    text: str,
):
    """Send an email from the agent's AgentMail inbox."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    agent = db.get_by_field("agent_identities", AgentIdentity, "company_id", company_id)
    if not agent or not agent.agentmail_address:
        raise HTTPException(400, "No agent inbox configured")

    try:
        await agentmail_client.send_email(
            from_inbox=agent.agentmail_address,
            to=to,
            subject=subject,
            text=text,
        )
        emit_activity(company_id, "email_sent",
                      f"Email sent to {to}",
                      subject[:100])
        return {"status": "sent", "to": to, "subject": subject}
    except Exception as e:
        print(f"[AgentMail] Send error: {e}")
        raise HTTPException(500, str(e))


# ─── Dashboard Chat ──────────────────────────────────────────────────────────

@app.post("/api/dashboard/chat")
async def dashboard_chat(company_id: str, question: str):
    """Internal DevRel chat — query activity, leads, and conversations."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    # Gather activity feed
    activities = db.get_many_by_field("activity_feed", ActivityFeedItem, "company_id", company_id)
    activities.sort(key=lambda x: getattr(x, "ts", ""), reverse=True)
    recent_activities = activities[:30]
    activity_text = "\n".join([
        f"- [{a.ts[:16]}] {a.type}: {a.title} — {a.detail}"
        for a in recent_activities
    ]) or "No recent activity."

    # Gather conversations
    convos = db.get_many_by_field("conversation_logs", ConversationLog, "company_id", company_id)
    convos.sort(key=lambda x: getattr(x, "created_at", ""), reverse=True)
    recent_convos = convos[:20]
    convos_text = "\n".join([
        f"- [{c.platform}] {getattr(c, 'user_id', 'anon')}: \"{c.question}\" → \"{c.answer[:80]}\" (confidence: {c.confidence:.0%}, escalated: {c.escalated})"
        for c in recent_convos
    ]) or "No recent conversations."

    # Gather leads (run extraction if needed)
    leads_text = "No leads extracted yet. User can click 'Extract Leads' on the dashboard."

    answer = await llm.dashboard_chat(
        question=question,
        company_name=company.name,
        activity_summary=activity_text,
        conversations_summary=convos_text,
        leads_summary=leads_text,
    )

    return {"answer": answer}


# ─── Browser Use: Daily Lead Research Cron ───────────────────────────────────

@app.post("/api/cron/daily-research")
async def daily_lead_research(company_id: str, background_tasks: BackgroundTasks):
    """Trigger the daily Browser Use research job: find leads, community signals, competitor activity."""
    company = db.get_by_field("companies", Company, "company_id", company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    emit_activity(company_id, "cron_started",
                  "Daily research job started",
                  "Browser Use agent scanning for leads and activity", status="pending")

    background_tasks.add_task(_run_daily_research, company_id, company.name, company.website_url)
    return {"status": "started", "message": "Daily research job queued"}


async def _run_daily_research(company_id: str, company_name: str, website_url: str):
    """Background: Use Browser Use to research leads and DevRel-relevant activity."""
    research_prompt = f"""You are a DevRel research agent for {company_name} ({website_url}).
Your daily job is to find valuable intelligence. Do the following:

1. Go to GitHub and search for "{company_name}" — find recent issues, discussions, or mentions. Note any developers who seem interested.
2. Go to Twitter/X and search for "{company_name}" — find recent tweets mentioning the product. Note usernames and what they said.
3. Go to Reddit and search for "{company_name}" — find any threads or comments about it.
4. Check Hacker News for any mentions.

For each finding, report:
- Platform (GitHub/Twitter/Reddit/HN)
- Username
- What they said or did
- Lead score (1-10, how likely they are to be a real lead)
- Suggested follow-up action

Format as a structured report."""

    try:
        client = browser_use_client.get_client()
        result = await client.run(research_prompt)
        output = result.output if hasattr(result, "output") else str(result)

        # Log the research as a browser run
        run = BrowserRun(
            company_id=company_id,
            purpose="daily_lead_research",
            status="completed",
            run_log=[f"Daily research completed at {now_iso()}", output[:500]],
            final_url="https://github.com",
        )
        db.insert("browser_runs", run)

        # Store research into Supermemory for the dashboard chat to access
        try:
            await supermemory_client.add_memory(
                content=f"Daily research report ({now_iso()}):\n{output}",
                company_id=company_id,
                metadata={"source": "daily_research", "date": now_iso()},
            )
        except Exception:
            pass

        # Extract leads from the research using LLM
        leads_result = await llm.extract_leads(output, company_name)

        emit_activity(company_id, "cron_completed",
                      "Daily research completed",
                      f"Found {len(leads_result.get('leads', []))} potential leads across GitHub, Twitter, Reddit, HN")

    except Exception as e:
        print(f"[Cron] Daily research failed: {e}")
        emit_activity(company_id, "cron_completed",
                      "Daily research failed",
                      str(e), status="error")


# ─── Run ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
