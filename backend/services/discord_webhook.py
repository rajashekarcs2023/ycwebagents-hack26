"""Discord webhook client — posts messages to Discord channels via webhook URL."""

import os
import httpx


WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL", "")


async def post_message(content: str, username: str = "Calex", avatar_url: str = "") -> bool:
    """Post a message to the Discord channel via webhook.
    Returns True if successful."""
    if not WEBHOOK_URL:
        print("[Discord Webhook] No DISCORD_WEBHOOK_URL set — skipping")
        return False

    payload = {
        "content": content,
        "username": username,
    }
    if avatar_url:
        payload["avatar_url"] = avatar_url

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(WEBHOOK_URL, json=payload)
            resp.raise_for_status()
            print(f"[Discord Webhook] Posted message ({len(content)} chars)")
            return True
    except Exception as e:
        print(f"[Discord Webhook] Failed: {e}")
        return False
