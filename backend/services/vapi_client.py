"""Vapi client — verified from official REST API docs."""

import os
import httpx

BASE_URL = "https://api.vapi.ai"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {os.environ.get('VAPI_API_KEY', '')}",
        "Content-Type": "application/json",
    }


async def create_assistant(
    agent_name: str,
    company_name: str,
    system_prompt: str,
    server_url: str | None = None,
) -> dict:
    """Create a Vapi voice assistant. Returns {id, name}."""
    payload = {
        "name": f"{agent_name} - {company_name}",
        "model": {
            "provider": "openai",
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": system_prompt},
            ],
        },
        "firstMessage": f"Hi! I'm {agent_name}, the developer relations agent for {company_name}. How can I help you today?",
    }
    if server_url:
        payload["serverUrl"] = server_url

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{BASE_URL}/assistant", json=payload, headers=_headers())
        resp.raise_for_status()
        data = resp.json()
        assistant_id = data.get("id", "")
        print(f"[Vapi] Created assistant: {assistant_id}")
        return {"id": assistant_id, "name": data.get("name", "")}


async def create_phone_number(assistant_id: str) -> dict:
    """Create a free Vapi phone number and assign it to an assistant.
    Returns {id, number, provider}."""
    payload = {
        "provider": "vapi",
        "assistantId": assistant_id,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{BASE_URL}/phone-number", json=payload, headers=_headers())
        resp.raise_for_status()
        data = resp.json()
        phone_id = data.get("id", "")
        # Vapi free numbers may not have a traditional number — use the ID for web calling
        number = data.get("number") or data.get("sipUri") or f"vapi-web:{phone_id}"
        print(f"[Vapi] Created phone number: {number} (id={phone_id})")
        return {"id": phone_id, "number": number}


async def list_phone_numbers() -> list[dict]:
    """List all phone numbers on the account."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{BASE_URL}/phone-number", headers=_headers())
        resp.raise_for_status()
        return resp.json()
