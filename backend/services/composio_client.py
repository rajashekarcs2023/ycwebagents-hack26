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
