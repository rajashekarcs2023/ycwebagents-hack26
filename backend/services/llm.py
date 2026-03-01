"""OpenAI LLM client for Calex — generates answers from company knowledge context."""

import os
import json
from openai import OpenAI


def get_client() -> OpenAI:
    return OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))


async def generate_answer(
    question: str,
    context: str,
    company_name: str,
    tone: str = "friendly",
    requested_mode: str = "answer",
) -> dict:
    """Generate an answer to a developer question using company knowledge.
    
    Returns dict with:
        answer_text, confidence (0-1), suggested_links[], should_show,
        steps[], navigation_goal, narration_script
    """
    client = get_client()

    system_prompt = f"""You are Calex, an AI Developer Relations agent for {company_name}.
Your tone is {tone}. You answer developer questions using ONLY the provided company knowledge.

Rules:
- NEVER invent product facts. If the context doesn't contain the answer, say so honestly and set confidence low.
- Always be concise and helpful.
- Include relevant links from the context when available.
- If the question involves billing, security, or legal topics, set escalation to true.

The user's requested mode is: {requested_mode}
- If "answer": provide a direct answer.
- If "show": also generate step-by-step walkthrough instructions and a narration script that could be read aloud to guide someone through the website/docs.

Respond with ONLY valid JSON (no markdown, no code fences):
{{
  "answer_text": "your answer here",
  "confidence": 0.85,
  "suggested_links": ["https://..."],
  "should_show": false,
  "escalation": false,
  "escalation_reason": "",
  "steps": ["Step 1: ...", "Step 2: ..."],
  "navigation_goal": "what page to navigate to",
  "narration_script": "A spoken walkthrough script..."
}}"""

    user_msg = f"""Context (company knowledge):
{context}

Developer question: {question}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)

        return {
            "answer_text": parsed.get("answer_text", "I couldn't find an answer."),
            "confidence": float(parsed.get("confidence", 0.0)),
            "suggested_links": parsed.get("suggested_links", []),
            "should_show": parsed.get("should_show", False),
            "escalation": parsed.get("escalation", False),
            "escalation_reason": parsed.get("escalation_reason", ""),
            "steps": parsed.get("steps", []),
            "navigation_goal": parsed.get("navigation_goal", ""),
            "narration_script": parsed.get("narration_script", ""),
        }
    except Exception as e:
        print(f"[LLM] Error: {e}")
        return {
            "answer_text": "Sorry, I encountered an error generating a response.",
            "confidence": 0.0,
            "suggested_links": [],
            "should_show": False,
            "escalation": False,
            "escalation_reason": "",
            "steps": [],
            "navigation_goal": "",
            "narration_script": "",
        }


async def generate_community_response(
    message: str,
    context: str,
    company_name: str,
    tone: str = "friendly",
) -> dict:
    """Generate a response to a community (Discord/Slack) question.
    
    Returns dict with:
        answer_text, confidence, escalation, escalation_reason, suggested_links[]
    """
    client = get_client()

    system_prompt = f"""You are Calex, an AI Developer Relations agent for {company_name} responding in a community channel (Discord/Slack).
Your tone is {tone}. Keep responses concise and helpful — this is a chat context, not documentation.

Rules:
- NEVER invent product facts. Only use provided context.
- If you're not confident, set escalation to true so a human can review.
- If the question involves billing, security, or legal, always escalate.
- Be warm and helpful — you represent the company.

Respond with ONLY valid JSON:
{{
  "answer_text": "your response",
  "confidence": 0.85,
  "escalation": false,
  "escalation_reason": "",
  "suggested_links": ["https://..."]
}}"""

    user_msg = f"""Context (company knowledge):
{context}

Community message: {message}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)

        return {
            "answer_text": parsed.get("answer_text", ""),
            "confidence": float(parsed.get("confidence", 0.0)),
            "escalation": parsed.get("escalation", False),
            "escalation_reason": parsed.get("escalation_reason", ""),
            "suggested_links": parsed.get("suggested_links", []),
        }
    except Exception as e:
        print(f"[LLM] Community response error: {e}")
        return {
            "answer_text": "",
            "confidence": 0.0,
            "escalation": True,
            "escalation_reason": f"LLM error: {e}",
            "suggested_links": [],
        }
