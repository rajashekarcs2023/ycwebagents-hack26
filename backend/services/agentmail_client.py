"""AgentMail client — verified from official Python SDK docs."""

import os
from agentmail import AgentMail


def get_client() -> AgentMail:
    return AgentMail(api_key=os.environ.get("AGENT_MAIL_API", ""))


async def create_inbox(agent_name: str = "calex") -> str:
    """Create a new inbox. Returns the email address."""
    client = get_client()
    inbox = client.inboxes.create()
    address = getattr(inbox, "inbox_id", None) or getattr(inbox, "address", None) or getattr(inbox, "email", None) or str(inbox)
    print(f"[AgentMail] Created inbox: {address}")
    return address


async def send_email(from_inbox: str, to: str, subject: str, text: str):
    """Send an email from an agent inbox."""
    client = get_client()
    client.inboxes.messages.send(
        inbox_id=from_inbox,
        to=to,
        subject=subject,
        text=text,
    )
    print(f"[AgentMail] Sent email from {from_inbox} to {to}: {subject}")


async def send_escalation(
    from_inbox: str,
    founder_email: str,
    question: str,
    draft_answer: str,
    confidence: float,
    platform: str = "widget",
):
    """Send an escalation email to the founder with context."""
    subject = f"[Calex Escalation] Question from {platform}"
    body = f"""Hi,

Calex received a question it wasn't confident enough to answer automatically.

Platform: {platform}
Question: {question}

Draft answer (confidence: {confidence:.0%}):
{draft_answer}

Please review and respond directly if needed.

— Calex
"""
    await send_email(from_inbox, founder_email, subject, body)
