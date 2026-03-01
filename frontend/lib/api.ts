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
  twilio_number: string
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
): Promise<{ status: string }> {
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
