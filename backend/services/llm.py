"""LLM client for Calex — generates answers from company knowledge context.

Supports OpenAI (default) and Dedalus Labs (provider-agnostic: OpenAI, Anthropic, Google, xAI, etc.).
Set DEDALUS_API_KEY to use Dedalus as the LLM backend.
"""

import os
import json
from openai import OpenAI

# Model to use — Dedalus allows cross-provider model strings like "anthropic/claude-opus-4-6"
LLM_MODEL = os.environ.get("LLM_MODEL", "gpt-4o")


def get_client():
    """Return Dedalus client if available, otherwise OpenAI."""
    dedalus_key = os.environ.get("DEDALUS_API_KEY", "")
    if dedalus_key:
        try:
            from dedalus_labs import AsyncDedalus
            # Dedalus SDK exposes an OpenAI-compatible chat.completions.create() interface
            print("[LLM] Using Dedalus Labs (provider-agnostic)")
            return AsyncDedalus()
        except ImportError:
            print("[LLM] Dedalus SDK not installed, falling back to OpenAI")
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
- ALWAYS extract and include actual URLs from the provided context in suggested_links. Look for any https:// URLs mentioned in the knowledge chunks. This is CRITICAL — never return an empty suggested_links if there are relevant URLs in the context.
- If the question involves billing, security, or legal topics, set escalation to true.

The user's requested mode is: {requested_mode}
- If "answer": provide a direct answer with relevant URLs from the context.
- If "show": also generate step-by-step walkthrough instructions and a narration script that could be read aloud to guide someone through the website/docs. The suggested_links MUST contain the specific page URL where the answer can be found — this is used to navigate the user's browser directly to that page.

Respond with ONLY valid JSON (no markdown, no code fences):
{{
  "answer_text": "your answer here",
  "confidence": 0.85,
  "suggested_links": ["https://docs.example.com/specific-page"],
  "should_show": false,
  "escalation": false,
  "escalation_reason": "",
  "steps": ["Step 1: ...", "Step 2: ..."],
  "navigation_goal": "the specific docs page URL to navigate to",
  "narration_script": "A spoken walkthrough script..."
}}"""

    user_msg = f"""Context (company knowledge):
{context}

Developer question: {question}"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
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


async def generate_linkedin_post(
    company_name: str,
    recent_activity: str,
    tone: str = "friendly",
    topic_hint: str = "",
) -> dict:
    """Generate a LinkedIn post based on recent community activity.
    
    Returns dict with: post_text, hashtags[]
    """
    client = get_client()

    system_prompt = f"""You are a DevRel content writer for {company_name}. 
Your job is to write engaging LinkedIn posts that share developer community insights, product updates, or helpful tips.

Tone: {tone}. Write as a human DevRel professional, not as AI.

Rules:
- Keep it under 1300 characters (LinkedIn optimal length)
- Use short paragraphs and line breaks for readability
- Include 1-2 relevant emojis per paragraph (not excessive)
- End with a call-to-action or question to drive engagement
- Include 3-5 relevant hashtags at the end
- Base the content on the provided community activity/discussions
- Make it genuinely useful and insightful — not generic fluff

Respond with ONLY valid JSON:
{{
  "post_text": "the full linkedin post text including emojis and line breaks",
  "hashtags": ["#DevTools", "#AI", ...]
}}"""

    user_msg = f"""Recent community activity and discussions:
{recent_activity}

{f"Topic focus: {topic_hint}" if topic_hint else "Write about the most interesting topic from the activity."}

Generate a compelling LinkedIn post based on this."""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)
        return {
            "post_text": parsed.get("post_text", ""),
            "hashtags": parsed.get("hashtags", []),
        }
    except Exception as e:
        print(f"[LLM] LinkedIn post generation error: {e}")
        return {"post_text": "", "hashtags": []}


async def extract_leads(
    conversations: str,
    company_name: str,
) -> dict:
    """Analyze recent conversations and extract potential leads/interested developers.
    
    Returns dict with: leads[] each having {name, email, interest, score, suggested_action, meeting_topic}
    """
    client = get_client()

    system_prompt = f"""You are an AI lead intelligence agent for {company_name}.
Analyze the recent community conversations and widget interactions below to identify potential developer leads — people who seem genuinely interested in adopting or integrating the product.

For each lead, provide:
- name: their username or identifier
- email: if mentioned, otherwise ""
- interest: what they're interested in (1-2 sentences)
- score: 1-10 how likely they are to convert (based on question depth, engagement)
- suggested_action: what the DevRel team should do next
- meeting_topic: a suggested 30-min call topic if a meeting is warranted

Return ONLY valid JSON:
{{
  "leads": [
    {{
      "name": "dev_user_42",
      "email": "",
      "interest": "Interested in stealth mode for enterprise use",
      "score": 8,
      "suggested_action": "Schedule a call to discuss enterprise licensing",
      "meeting_topic": "Enterprise stealth mode setup and pricing"
    }}
  ],
  "summary": "Brief summary of today's lead activity"
}}"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Recent conversations:\n{conversations}"},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)
        return {
            "leads": parsed.get("leads", []),
            "summary": parsed.get("summary", ""),
        }
    except Exception as e:
        print(f"[LLM] Lead extraction error: {e}")
        return {"leads": [], "summary": ""}


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
            model=LLM_MODEL,
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


async def dashboard_chat(
    question: str,
    company_name: str,
    activity_summary: str,
    conversations_summary: str,
    leads_summary: str,
) -> str:
    """Answer a DevRel's question about their company's activity, leads, and conversations."""
    client = get_client()

    system_prompt = f"""You are Calex, an AI DevRel assistant for {company_name}.
The DevRel team is asking you about recent activity, leads, and community interactions.
Answer concisely and helpfully based on the data provided below.

If asked about leads, mention names, scores, and interests.
If asked about activity, summarize what happened today.
If asked about contacts or conversations, highlight who reached out and what they asked.
Use bullet points for lists. Be specific with data — don't be vague.
If the data is empty, say so honestly.

RECENT ACTIVITY:
{activity_summary}

RECENT CONVERSATIONS:
{conversations_summary}

LEADS INTELLIGENCE:
{leads_summary}"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question},
            ],
            temperature=0.4,
        )
        return response.choices[0].message.content or "No response generated."
    except Exception as e:
        print(f"[LLM] Dashboard chat error: {e}")
        return f"Sorry, I couldn't process that: {e}"
