"""Composio client — enables Calex to use 1000+ tool integrations (Gmail, GitHub, Slack, etc.)."""

import os
from composio import Composio
from composio_openai_agents import OpenAIAgentsProvider


COMPOSIO_API_KEY = os.environ.get("COMPOSIO_API_KEY", "")


def get_composio() -> Composio | None:
    if not COMPOSIO_API_KEY:
        print("[Composio] No API key — disabled")
        return None
    return Composio(api_key=COMPOSIO_API_KEY, provider=OpenAIAgentsProvider())


async def create_session(user_id: str, manage_connections: bool = True) -> dict:
    """Create a Composio session for a user. Returns session info including MCP URL."""
    composio = get_composio()
    if not composio:
        return {"error": "Composio not configured"}

    try:
        session = composio.create(
            user_id=user_id,
            manage_connections=manage_connections,
        )
        return {
            "user_id": user_id,
            "mcp_url": session.mcp.url if hasattr(session, "mcp") else None,
            "session": session,
        }
    except Exception as e:
        print(f"[Composio] Session creation failed: {e}")
        return {"error": str(e)}


async def get_tools(user_id: str) -> list:
    """Get available Composio tools for a user."""
    composio = get_composio()
    if not composio:
        return []

    try:
        session = composio.create(user_id=user_id)
        tools = session.tools()
        return tools
    except Exception as e:
        print(f"[Composio] Failed to get tools: {e}")
        return []


async def authorize_toolkit(user_id: str, toolkit: str, callback_url: str = "") -> dict:
    """Start OAuth flow for a toolkit (e.g., 'gmail', 'github', 'slack').
    Returns redirect URL for user to authorize."""
    composio = get_composio()
    if not composio:
        return {"error": "Composio not configured"}

    try:
        session = composio.create(
            user_id=user_id,
            manage_connections=False,
        )
        kwargs = {"callback_url": callback_url} if callback_url else {}
        connection_request = session.authorize(toolkit, **kwargs)
        redirect_url = getattr(connection_request, "redirect_url", None)
        print(f"[Composio] Authorization URL for {toolkit}: {redirect_url}")
        return {
            "toolkit": toolkit,
            "redirect_url": redirect_url,
            "connection_request": connection_request,
        }
    except Exception as e:
        print(f"[Composio] Authorization failed for {toolkit}: {e}")
        return {"error": str(e)}


async def execute_linkedin_post(user_id: str, post_text: str) -> dict:
    """Post content to LinkedIn using Composio's LinkedIn integration."""
    composio = get_composio()
    if not composio:
        return {"error": "Composio not configured"}

    try:
        session = composio.create(user_id=user_id, manage_connections=False)
        result = session.execute_action(
            action="LINKEDIN_CREATE_SHARE",
            params={
                "text": post_text,
            },
        )
        print(f"[Composio] LinkedIn post result: {result}")
        return {
            "status": "posted",
            "result": str(result),
        }
    except Exception as e:
        print(f"[Composio] LinkedIn post failed: {e}")
        return {"error": str(e)}


async def create_calendar_event(
    user_id: str,
    title: str,
    description: str,
    start_datetime: str,
    end_datetime: str,
    attendee_email: str = "",
) -> dict:
    """Create a Google Calendar event via Composio."""
    composio = get_composio()
    if not composio:
        return {"error": "Composio not configured"}

    try:
        session = composio.create(user_id=user_id, manage_connections=False)
        params = {
            "summary": title,
            "description": description,
            "start": {"dateTime": start_datetime, "timeZone": "America/Los_Angeles"},
            "end": {"dateTime": end_datetime, "timeZone": "America/Los_Angeles"},
        }
        if attendee_email:
            params["attendees"] = [{"email": attendee_email}]

        result = session.execute_action(
            action="GOOGLECALENDAR_CREATE_EVENT",
            params=params,
        )
        print(f"[Composio] Calendar event created: {result}")
        return {"status": "created", "result": str(result)}
    except Exception as e:
        print(f"[Composio] Calendar event failed: {e}")
        return {"error": str(e)}


async def append_sheet_row(
    user_id: str,
    spreadsheet_id: str,
    values: list[str],
    sheet_range: str = "Sheet1!A:Z",
) -> dict:
    """Append a row to a Google Sheet via Composio."""
    composio = get_composio()
    if not composio:
        return {"error": "Composio not configured"}

    try:
        session = composio.create(user_id=user_id, manage_connections=False)
        result = session.execute_action(
            action="GOOGLESHEETS_BATCH_UPDATE",
            params={
                "spreadsheet_id": spreadsheet_id,
                "range": sheet_range,
                "values": [values],
                "value_input_option": "USER_ENTERED",
            },
        )
        print(f"[Composio] Sheet row appended: {result}")
        return {"status": "appended", "result": str(result)}
    except Exception as e:
        print(f"[Composio] Sheet append failed: {e}")
        return {"error": str(e)}


async def fetch_slack_messages(
    user_id: str,
    channel_name: str = "all-calexai",
    limit: int = 20,
) -> dict:
    """Fetch recent messages from a Slack channel via Composio."""
    composio = get_composio()
    if not composio:
        return {"error": "Composio not configured"}

    try:
        session = composio.create(user_id=user_id, manage_connections=False)

        # First, list channels to find the channel ID
        channels_result = session.execute_action(
            action="SLACK_LIST_CONVERSATIONS",
            params={"types": "public_channel", "limit": 100},
        )

        # Find our channel
        channel_id = None
        channels = getattr(channels_result, "channels", [])
        if isinstance(channels_result, dict):
            channels = channels_result.get("channels", [])
        # Try to parse the result
        result_str = str(channels_result)
        if not channel_id:
            # Try to find channel by name in the raw result
            import json as _json
            try:
                if hasattr(channels_result, "data"):
                    data = channels_result.data
                elif hasattr(channels_result, "response_data"):
                    data = channels_result.response_data
                else:
                    data = channels_result
                if isinstance(data, str):
                    data = _json.loads(data)
                if isinstance(data, dict):
                    for ch in data.get("channels", []):
                        if ch.get("name") == channel_name:
                            channel_id = ch["id"]
                            break
            except Exception:
                pass

        if not channel_id:
            print(f"[Composio] Could not find Slack channel #{channel_name}, trying direct fetch")
            # Fallback: try to read messages using channel name
            channel_id = channel_name

        # Fetch messages from the channel
        messages_result = session.execute_action(
            action="SLACK_CONVERSATIONS_HISTORY",
            params={"channel": channel_id, "limit": limit},
        )

        # Parse messages
        messages = []
        try:
            import json as _json
            if hasattr(messages_result, "data"):
                data = messages_result.data
            elif hasattr(messages_result, "response_data"):
                data = messages_result.response_data
            else:
                data = messages_result
            if isinstance(data, str):
                data = _json.loads(data)
            if isinstance(data, dict):
                for msg in data.get("messages", []):
                    messages.append({
                        "user": msg.get("user", "unknown"),
                        "text": msg.get("text", ""),
                        "ts": msg.get("ts", ""),
                    })
        except Exception as e:
            print(f"[Composio] Slack message parsing: {e}")
            messages = [{"user": "raw", "text": str(messages_result)[:2000], "ts": ""}]

        print(f"[Composio] Fetched {len(messages)} Slack messages from #{channel_name}")
        return {"channel": channel_name, "messages": messages}
    except Exception as e:
        print(f"[Composio] Slack fetch failed: {e}")
        return {"error": str(e)}


async def check_toolkits(user_id: str) -> list[dict]:
    """Check which toolkits are connected for a user."""
    composio = get_composio()
    if not composio:
        return []

    try:
        session = composio.create(
            user_id=user_id,
            manage_connections=False,
        )
        toolkits = session.toolkits()
        result = []
        for tk in toolkits.items:
            is_active = tk.connection.is_active if hasattr(tk, "connection") and tk.connection else False
            result.append({
                "name": tk.name,
                "slug": getattr(tk, "slug", tk.name),
                "connected": is_active,
            })
        return result
    except Exception as e:
        print(f"[Composio] Check toolkits failed: {e}")
        return []
