const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export { API }

export interface OnboardPayload {
  company_name: string
  website_url: string
  docs_urls: string[]
  agent_name: string
  tone: string
  founder_email: string
  demo_mode: boolean
}

export interface OnboardResponse {
  company_id: string
  slug: string
  agentmail_address: string
  vapi_phone_number: string
  demo_mode: boolean
}

export interface ActivityFeedItem {
  company_id: string
  ts: string
  type:
    | "widget_answered"
    | "walkthrough_executed"
    | "community_answered"
    | "escalated"
    | "onboarding_started"
    | "memory_built"
    | "identity_created"
    | "setup_complete"
    | "crawling"
    | "community_question"
    | "composio_auth"
    | "linkedin_posted"
    | "leads_extracted"
    | "calendar_scheduled"
    | "sheet_updated"
    | "slack_fetched"
    | "slack_linkedin_generated"
    | "email_sent"
  title: string
  detail: string
  status: "success" | "pending" | "error"
  artifact_urls?: string[]
  session_id?: string
  meta_json?: Record<string, unknown>
}

export interface AskAnswerResponse {
  mode: "answer"
  answer_text: string
  confidence: number
  suggested_links: string[]
}

export interface AskShowResponse {
  mode: "show"
  answer_text: string
  steps: string[]
  final_url: string
  session_id: string
  narration_script: string
  narration_audio_url: string | null
  suggested_links: string[]
  navigation_goal: string
}

export type AskResponse = AskAnswerResponse | AskShowResponse

export interface BrowserRunResponse {
  company_id: string
  session_id: string
  purpose: string
  status: "running" | "completed" | "failed"
  run_log: string[]
  preview_frames: string[]
  final_url: string
  created_at: string
}

export async function onboard(payload: OnboardPayload): Promise<OnboardResponse> {
  const res = await fetch(`${API}/api/onboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Onboarding failed")
  return res.json()
}

export async function getActivity(companyId: string): Promise<ActivityFeedItem[]> {
  const res = await fetch(`${API}/api/activity?company_id=${companyId}`)
  if (!res.ok) throw new Error("Failed to fetch activity")
  return res.json()
}

export async function askWidget(
  companyId: string,
  question: string,
  mode: "answer" | "show"
): Promise<AskResponse> {
  const res = await fetch(`${API}/api/widget/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_id: companyId,
      question,
      requested_mode: mode,
    }),
  })
  if (!res.ok) throw new Error("Widget ask failed")
  return res.json()
}

export async function getBrowserRun(sessionId: string): Promise<BrowserRunResponse> {
  const res = await fetch(`${API}/api/browser/run?session_id=${sessionId}`)
  if (!res.ok) throw new Error("Failed to fetch browser run")
  return res.json()
}

export async function simulateCommunityEvent(
  companyId: string,
  platform: "discord" | "slack",
  messageText: string
): Promise<{ status: string; answer_text?: string; escalated?: boolean }> {
  const res = await fetch(`${API}/api/demo/community_event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_id: companyId,
      platform,
      channel: "general",
      user_id: "demo-user",
      message_text: messageText,
    }),
  })
  if (!res.ok) throw new Error("Simulation failed")
  return res.json()
}

export interface LinkedInPostResponse {
  post_text: string
  hashtags: string[]
}

export async function generateLinkedInPost(
  companyId: string,
  topicHint: string = ""
): Promise<LinkedInPostResponse> {
  const res = await fetch(`${API}/api/linkedin/generate?company_id=${companyId}&topic_hint=${encodeURIComponent(topicHint)}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("LinkedIn generation failed")
  return res.json()
}

export async function postToLinkedIn(
  companyId: string,
  postText: string
): Promise<{ status: string }> {
  const res = await fetch(`${API}/api/linkedin/post?company_id=${companyId}&post_text=${encodeURIComponent(postText)}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("LinkedIn post failed")
  return res.json()
}

export async function authorizeComposio(
  companyId: string,
  toolkit: string,
): Promise<{ toolkit: string; redirect_url: string }> {
  const res = await fetch(`${API}/api/composio/authorize?company_id=${companyId}&toolkit=${toolkit}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Authorization failed")
  return res.json()
}

// ─── Leads Intelligence ────────────────────────────────────────────────────

export interface Lead {
  name: string
  email: string
  interest: string
  score: number
  suggested_action: string
  meeting_topic: string
}

export interface LeadsResponse {
  leads: Lead[]
  summary: string
}

export async function extractLeads(companyId: string): Promise<LeadsResponse> {
  const res = await fetch(`${API}/api/leads/extract?company_id=${companyId}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Lead extraction failed")
  return res.json()
}

// ─── Google Calendar ───────────────────────────────────────────────────────

export async function scheduleMeeting(
  companyId: string,
  title: string,
  description?: string,
  startDatetime?: string,
  endDatetime?: string,
  attendeeEmail?: string,
): Promise<{ status: string }> {
  const params = new URLSearchParams({ company_id: companyId, title })
  if (description) params.set("description", description)
  if (startDatetime) params.set("start_datetime", startDatetime)
  if (endDatetime) params.set("end_datetime", endDatetime)
  if (attendeeEmail) params.set("attendee_email", attendeeEmail)
  const res = await fetch(`${API}/api/calendar/schedule?${params}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Calendar scheduling failed")
  return res.json()
}

// ─── Google Sheets ─────────────────────────────────────────────────────────

export async function logLeadToSheet(
  companyId: string,
  spreadsheetId: string,
  leadName: string,
  interest: string,
  score: number,
  suggestedAction: string,
): Promise<{ status: string }> {
  const params = new URLSearchParams({
    company_id: companyId,
    spreadsheet_id: spreadsheetId,
    lead_name: leadName,
    interest,
    score: String(score),
    suggested_action: suggestedAction,
  })
  const res = await fetch(`${API}/api/sheets/log-lead?${params}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Sheet logging failed")
  return res.json()
}

// ─── Slack → LinkedIn ─────────────────────────────────────────────────────

export interface SlackLinkedInResponse {
  post_text: string
  hashtags: string[]
  slack_messages: number
  error?: string
}

export async function generateLinkedInFromSlack(
  companyId: string,
  channel: string = "all-calexai",
): Promise<SlackLinkedInResponse> {
  const res = await fetch(`${API}/api/slack/generate-linkedin?company_id=${companyId}&channel=${encodeURIComponent(channel)}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Slack-to-LinkedIn failed")
  return res.json()
}

// ─── AgentMail ────────────────────────────────────────────────────────────

export interface AgentMailMessage {
  id: string
  from: string
  to: string
  subject: string
  text: string
  date: string
  direction: "inbound" | "outbound"
}

export interface AgentMailInbox {
  inbox: string | null
  messages: AgentMailMessage[]
  error?: string
}

export async function getAgentMailInbox(companyId: string): Promise<AgentMailInbox> {
  const res = await fetch(`${API}/api/agentmail/inbox?company_id=${companyId}`)
  if (!res.ok) throw new Error("AgentMail inbox fetch failed")
  return res.json()
}

export async function sendAgentMail(
  companyId: string,
  to: string,
  subject: string,
  text: string,
): Promise<{ status: string }> {
  const params = new URLSearchParams({ company_id: companyId, to, subject, text })
  const res = await fetch(`${API}/api/agentmail/send?${params}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("AgentMail send failed")
  return res.json()
}

// ─── Dashboard Chat ───────────────────────────────────────────────────────

export async function dashboardChat(
  companyId: string,
  question: string,
): Promise<{ answer: string }> {
  const params = new URLSearchParams({ company_id: companyId, question })
  const res = await fetch(`${API}/api/dashboard/chat?${params}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Dashboard chat failed")
  return res.json()
}

// ─── Daily Research Cron ──────────────────────────────────────────────────

export async function triggerDailyResearch(
  companyId: string,
): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API}/api/cron/daily-research?company_id=${companyId}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Daily research trigger failed")
  return res.json()
}
