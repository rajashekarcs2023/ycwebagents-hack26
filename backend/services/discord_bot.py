"""Real Discord bot — monitors FAQ channel, answers via Supermemory+OpenAI, escalates via AgentMail."""

import os
import ssl
import asyncio
import certifi
import discord
from discord import Intents

from services import supermemory_client, agentmail_client, llm
import db
from models import (
    Company, AgentIdentity, ConversationLog, ActivityFeedItem,
    new_id, now_iso,
)


intents = Intents.default()
intents.message_content = True

bot = discord.Client(intents=intents)

BOT_TOKEN = os.environ.get("DISCORD_BOT_TOKEN", "")
FAQ_CHANNEL_ID = os.environ.get("DISCORD_FAQ_CHANNEL_ID", "")


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


def get_first_company() -> tuple[Company | None, AgentIdentity | None]:
    """Get the first onboarded company (for demo, we route all Discord messages to it)."""
    companies = db.get_all("companies", Company)
    if not companies:
        return None, None
    company = companies[0]
    agent = db.get_by_field("agent_identities", AgentIdentity, "company_id", company.company_id)
    return company, agent


@bot.event
async def on_ready():
    print(f"[Discord] Bot logged in as {bot.user} (id={bot.user.id})")
    if FAQ_CHANNEL_ID:
        print(f"[Discord] Monitoring FAQ channel: {FAQ_CHANNEL_ID}")
    else:
        print("[Discord] No FAQ_CHANNEL_ID set — will respond to all channels")


@bot.event
async def on_message(message: discord.Message):
    # Ignore own messages
    if message.author == bot.user:
        return

    # Ignore bots
    if message.author.bot:
        return

    # Only respond in the FAQ channel if configured, or all channels if not
    if FAQ_CHANNEL_ID and str(message.channel.id) != FAQ_CHANNEL_ID:
        return

    # Ignore very short messages
    if len(message.content.strip()) < 5:
        return

    question = message.content.strip()
    print(f"[Discord] Question from {message.author.name}: {question[:80]}")

    # Get company context
    company, agent = get_first_company()
    if not company:
        await message.reply("⚠️ Calex isn't set up yet. Please onboard a company first!")
        return

    company_id = company.company_id

    emit_activity(company_id, "community_question",
                  f"Discord question in #{message.channel.name}",
                  question[:100], status="pending")

    # Show typing indicator while processing
    async with message.channel.typing():
        # Search Supermemory for context
        results = await supermemory_client.search_memory(question, company_id)
        context = supermemory_client.format_context(results)

        # Generate response
        llm_result = await llm.generate_community_response(
            message=question,
            context=context,
            company_name=company.name,
            tone=company.tone,
        )

    # Log conversation
    conv = ConversationLog(
        company_id=company_id,
        platform="discord",
        channel=str(message.channel.name),
        user_id=str(message.author.id),
        question=question,
        answer=llm_result["answer_text"],
        confidence=llm_result["confidence"],
        mode="answer",
        escalated=llm_result["escalation"],
    )
    db.insert("conversation_logs", conv)

    # Escalate or respond
    if llm_result["escalation"] or llm_result["confidence"] < 0.75:
        # Send response with low-confidence disclaimer
        reply = f"🤔 {llm_result['answer_text']}\n\n*I'm not fully confident in this answer — I've flagged it for the team to review.*"
        await message.reply(reply)

        # Escalate via AgentMail
        if agent and company.founder_email:
            try:
                await agentmail_client.send_escalation(
                    from_inbox=agent.agentmail_address,
                    founder_email=company.founder_email,
                    question=question,
                    draft_answer=llm_result["answer_text"],
                    confidence=llm_result["confidence"],
                    platform="discord",
                )
            except Exception as e:
                print(f"[Discord] Escalation email failed: {e}")

        emit_activity(company_id, "escalated", "Escalated from Discord",
                      f"#{message.channel.name}: {question[:80]}")
    else:
        # Confident response
        reply = llm_result["answer_text"]
        links = llm_result.get("suggested_links", [])
        if links:
            reply += "\n\n📎 " + " | ".join(links)

        await message.reply(reply)

        # Store learned Q&A back into memory
        try:
            await supermemory_client.add_memory(
                content=f"Q: {question}\nA: {llm_result['answer_text']}",
                company_id=company_id,
                metadata={"source": "discord_learned", "channel": str(message.channel.name)},
            )
        except Exception:
            pass

        emit_activity(company_id, "community_answered",
                      f"Answered in Discord #{message.channel.name}",
                      llm_result["answer_text"][:100])


async def start_bot():
    """Start the Discord bot. Call this from the FastAPI lifespan."""
    if not BOT_TOKEN:
        print("[Discord] No DISCORD_BOT_TOKEN set — bot disabled")
        return
    try:
        # Fix macOS SSL certificate issue
        ssl_ctx = ssl.create_default_context(cafile=certifi.where())
        connector = discord.http.aiohttp.TCPConnector(ssl=ssl_ctx)
        bot.http.connector = connector
        await bot.start(BOT_TOKEN)
    except Exception as e:
        print(f"[Discord] Bot failed to start: {e}")


async def stop_bot():
    """Stop the Discord bot gracefully."""
    if bot.is_ready():
        await bot.close()
