"""Pydantic models for Calex backend — data model + API contracts."""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


def new_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


# ─── Data Models (persisted) ────────────────────────────────────────────────

class Company(BaseModel):
    company_id: str = Field(default_factory=new_id)
    slug: str = ""
    name: str = ""
    website_url: str = ""
    docs_urls: list[str] = []
    doc_page_urls: list[str] = []
    tone: str = "friendly"
    founder_email: str = ""
    demo_mode: bool = True
    created_at: str = Field(default_factory=now_iso)


class AgentIdentity(BaseModel):
    company_id: str = ""
    agent_name: str = ""
    agentmail_address: str = ""
    vapi_assistant_id: str = ""
    vapi_phone_number: str = ""
    vapi_phone_number_id: str = ""
    created_at: str = Field(default_factory=now_iso)


class KnowledgeSource(BaseModel):
    company_id: str = ""
    url: str = ""
    source_type: str = "website"  # website | docs
    last_crawled_at: str = ""
    status: str = "pending"  # pending | crawling | done | failed


class ConversationLog(BaseModel):
    log_id: str = Field(default_factory=new_id)
    company_id: str = ""
    platform: str = "widget"  # widget | discord | slack | phone
    channel: str = ""
    user_id: str = ""
    question: str = ""
    answer: str = ""
    confidence: float = 0.0
    mode: str = "answer"  # answer | show
    escalated: bool = False
    created_at: str = Field(default_factory=now_iso)


class ActivityFeedItem(BaseModel):
    activity_id: str = Field(default_factory=new_id)
    company_id: str = ""
    ts: str = Field(default_factory=now_iso)
    type: str = ""  # onboarding_started | memory_built | identity_created | setup_complete | widget_answered | walkthrough_executed | community_answered | escalated
    title: str = ""
    detail: str = ""
    status: str = "success"  # success | pending | error
    artifact_urls: list[str] = []
    session_id: Optional[str] = None
    meta_json: Optional[dict] = None


class BrowserRun(BaseModel):
    company_id: str = ""
    session_id: str = Field(default_factory=new_id)
    purpose: str = ""
    status: str = "running"  # running | completed | failed
    run_log: list[str] = []
    preview_frames: list[str] = []
    final_url: str = ""
    created_at: str = Field(default_factory=now_iso)


# ─── API Request / Response Contracts ────────────────────────────────────────

class OnboardRequest(BaseModel):
    company_name: str
    website_url: str
    docs_urls: list[str] = []
    agent_name: str = "Calex"
    tone: str = "friendly"
    founder_email: str = ""
    demo_mode: bool = True


class OnboardResponse(BaseModel):
    company_id: str
    slug: str
    agentmail_address: str
    vapi_phone_number: str
    demo_mode: bool


class WidgetAskRequest(BaseModel):
    company_id: str
    question: str
    requested_mode: str = "answer"  # "answer" | "show"


class WidgetAnswerResponse(BaseModel):
    mode: str = "answer"
    answer_text: str
    confidence: float
    suggested_links: list[str] = []


class WidgetShowResponse(BaseModel):
    mode: str = "show"
    answer_text: str
    steps: list[str] = []
    final_url: str = ""
    session_id: str = ""
    narration_script: str = ""
    narration_audio_url: Optional[str] = None
    suggested_links: list[str] = []
    navigation_goal: str = ""


class CommunityEventRequest(BaseModel):
    company_id: str
    platform: str = "discord"  # discord | slack
    channel: str = "general"
    user_id: str = "demo-user"
    message_text: str


class CommunityEventResponse(BaseModel):
    status: str = "ok"
    answer_text: str = ""
    escalated: bool = False
