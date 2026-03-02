"""Direct Slack client using Bot Token — no Composio OAuth needed.

Required Slack Bot scopes: channels:read, channels:history, groups:read, groups:history, users:read
Add these at: https://api.slack.com/apps → Your App → OAuth & Permissions → Bot Token Scopes
"""

import os
import httpx

SLACK_BOT_TOKEN = os.environ.get("SLACK_BOT_TOKEN", "")
# Optional: set SLACK_CHANNEL_ID in .env to skip the channel lookup
SLACK_CHANNEL_ID = os.environ.get("SLACK_CHANNEL_ID", "")


async def fetch_messages(channel_name: str = "all-calexai", limit: int = 20) -> dict:
    """Fetch recent messages from a Slack channel using the Bot Token."""
    if not SLACK_BOT_TOKEN:
        return {"error": "SLACK_BOT_TOKEN not set in .env"}

    headers = {"Authorization": f"Bearer {SLACK_BOT_TOKEN}"}

    async with httpx.AsyncClient(timeout=15) as client:
        channel_id = SLACK_CHANNEL_ID

        # Step 1: Find channel ID (skip if already set in env)
        if not channel_id:
            try:
                resp = await client.get(
                    "https://slack.com/api/conversations.list",
                    headers=headers,
                    params={"types": "public_channel,private_channel", "limit": 200},
                )
                data = resp.json()
                if data.get("ok"):
                    for ch in data.get("channels", []):
                        if ch.get("name") == channel_name or ch.get("name") == channel_name.lstrip("#"):
                            channel_id = ch["id"]
                            break
                else:
                    err = data.get("error", "unknown")
                    print(f"[Slack] conversations.list failed: {err}")
                    if err == "missing_scope":
                        return {
                            "error": "Slack bot missing scopes. Add channels:read, channels:history, groups:read, groups:history at https://api.slack.com/apps → OAuth & Permissions. Or set SLACK_CHANNEL_ID in .env."
                        }
            except Exception as e:
                print(f"[Slack] Channel lookup error: {e}")

        if not channel_id:
            return {"error": f"Channel #{channel_name} not found. Set SLACK_CHANNEL_ID in your .env file."}

        # Step 2: Fetch message history
        resp2 = await client.get(
            "https://slack.com/api/conversations.history",
            headers=headers,
            params={"channel": channel_id, "limit": limit},
        )
        hist = resp2.json()
        if not hist.get("ok"):
            err = hist.get("error", "unknown")
            if err == "not_in_channel":
                # Try joining the channel first
                join_resp = await client.post(
                    "https://slack.com/api/conversations.join",
                    headers=headers,
                    json={"channel": channel_id},
                )
                if join_resp.json().get("ok"):
                    resp2 = await client.get(
                        "https://slack.com/api/conversations.history",
                        headers=headers,
                        params={"channel": channel_id, "limit": limit},
                    )
                    hist = resp2.json()
                    if not hist.get("ok"):
                        return {"error": f"Slack history error after join: {hist.get('error', 'unknown')}"}
                else:
                    return {"error": f"Bot not in channel and can't join. Invite the bot to #{channel_name}"}
            else:
                return {"error": f"Slack history error: {err}"}

        # Step 3: Get user info for display names
        user_cache = {}
        messages = []
        for msg in hist.get("messages", []):
            if msg.get("subtype") in ("channel_join", "channel_leave"):
                continue
            user_id = msg.get("user", "")
            display = user_id
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
                        display = profile.get("display_name") or profile.get("real_name") or user_id
                    user_cache[user_id] = display
                except Exception:
                    user_cache[user_id] = user_id

            messages.append({
                "user": user_cache.get(user_id, user_id),
                "text": msg.get("text", ""),
                "ts": msg.get("ts", ""),
            })

        print(f"[Slack] Fetched {len(messages)} messages from #{channel_name}")
        return {"channel": channel_name, "messages": messages}
