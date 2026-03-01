"""Direct Slack client using Bot Token — no Composio OAuth needed."""

import os
import httpx

SLACK_BOT_TOKEN = os.environ.get("SLACK_BOT_TOKEN", "")


async def fetch_messages(channel_name: str = "all-calexai", limit: int = 20) -> dict:
    """Fetch recent messages from a Slack channel using the Bot Token."""
    if not SLACK_BOT_TOKEN:
        return {"error": "SLACK_BOT_TOKEN not set in .env"}

    headers = {"Authorization": f"Bearer {SLACK_BOT_TOKEN}"}

    async with httpx.AsyncClient(timeout=15) as client:
        # Step 1: List channels to find channel ID
        resp = await client.get(
            "https://slack.com/api/conversations.list",
            headers=headers,
            params={"types": "public_channel,private_channel", "limit": 200},
        )
        data = resp.json()
        if not data.get("ok"):
            return {"error": f"Slack API error: {data.get('error', 'unknown')}"}

        channel_id = None
        for ch in data.get("channels", []):
            if ch.get("name") == channel_name or ch.get("name") == channel_name.lstrip("#"):
                channel_id = ch["id"]
                break

        if not channel_id:
            return {"error": f"Channel #{channel_name} not found. Available: {[c['name'] for c in data.get('channels', [])[:10]]}"}

        # Step 2: Fetch message history
        resp2 = await client.get(
            "https://slack.com/api/conversations.history",
            headers=headers,
            params={"channel": channel_id, "limit": limit},
        )
        hist = resp2.json()
        if not hist.get("ok"):
            return {"error": f"Slack history error: {hist.get('error', 'unknown')}"}

        # Step 3: Get user info for display names
        user_cache = {}

        messages = []
        for msg in hist.get("messages", []):
            if msg.get("subtype") in ("channel_join", "channel_leave", "bot_message"):
                continue
            user_id = msg.get("user", "")
            if user_id and user_id not in user_cache:
                try:
                    uresp = await client.get(
                        "https://slack.com/api/users.info",
                        headers=headers,
                        params={"user": user_id},
                    )
                    udata = uresp.json()
                    if udata.get("ok"):
                        profile = udata["user"].get("profile", {})
                        user_cache[user_id] = profile.get("display_name") or profile.get("real_name") or user_id
                    else:
                        user_cache[user_id] = user_id
                except Exception:
                    user_cache[user_id] = user_id

            messages.append({
                "user": user_cache.get(user_id, user_id),
                "text": msg.get("text", ""),
                "ts": msg.get("ts", ""),
            })

        print(f"[Slack] Fetched {len(messages)} messages from #{channel_name}")
        return {"channel": channel_name, "messages": messages}
