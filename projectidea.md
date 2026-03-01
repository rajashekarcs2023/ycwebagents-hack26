 Build the BACKEND for “Calex” — an AI DevRel Employee-as-a-Service — optimized for a YC hackathon demo.

WHAT CALEX IS
Calex is a DevRel “employee” that a company hires. Calex shows up across:
- Website widget (embedded like Intercom) + hosted help page fallback
- Discord/Slack community responder
- Email identity (AgentMail inbox)
- Phone/SMS identity (Twilio number)
- Founder dashboard activity feed
- Guided “Show me” walkthroughs: Browser Use navigates the company website/docs like a real person and returns step-by-step instructions + a narration script for voice.

SPONSOR TECH (use accurately; no incorrect claims)
- Browser Use: web automation platform/API; run guided navigation sessions and produce a run log (and optional screenshots/frames if available).
- AgentMail: API to create email inboxes for agents; use for DevRel identity + escalation emails.
- Twilio: programmable messaging/voice APIs; use for agent phone/SMS identity (SMS required; voice optional).
- Supermemory: long-term + short-term memory and context infrastructure for agents. Store company knowledge + learned Q/A + action outcomes for consistent recall. (Supermemory distinguishes memory vs RAG; do not conflate. You MAY optionally use Supermemory’s semantic search/RAG capabilities if available.)
- VibeFlow: visual workflow builder; implement endpoints as workflows with nodes (Webhook/HTTP/Agent/DB/Loop/etc.) per VibeFlow docs.

DEMO-FIRST REQUIREMENTS
- Implement DEMO MODE (demo_mode=true): deterministic, reliable, fast.
- Every workflow must write ActivityFeed events so the frontend looks “alive”.
- Every Browser Use run must persist a BrowserRuns record with run_log (required). preview_frames optional.

DATA MODEL (collections/tables)
Create these collections:
1) Companies: {company_id, slug, name, website_url, docs_urls[], tone, founder_email, demo_mode_bool, created_at}
2) AgentIdentities: {company_id, agent_name, agentmail_address, twilio_number, created_at}
3) Integrations: {company_id, discord_enabled, discord_channels[], slack_enabled, slack_channels[], calendar_enabled, calendar_id}
4) KnowledgeSources: {company_id, url, type, last_crawled_at, status}
5) LearnedPlaybooks: {company_id, topic, trigger_phrases[], steps[], final_url, narration_script, evidence_links[], last_verified_at}
6) ConversationLogs: {company_id, platform, channel, user_id, question, answer, confidence, mode, escalated, created_at}
7) ActivityFeed: {company_id, ts, type, title, detail, status, artifact_urls[], session_id?, meta_json?}
8) BrowserRuns: {company_id, session_id, purpose, status, run_log[], preview_frames[], final_url, created_at}
9) OutreachTasks (optional): {company_id, task_id, platform, goal, status, plan_json, artifacts[], created_at}

GLOBAL RESPONSE CONTRACTS (frontend depends on these)
- /api/widget/ask MUST return deterministic JSON.
- Show-me mode MUST return: {mode:"show", answer_text, steps[], final_url, session_id, narration_script}
- BrowserRuns MUST store run_log[] (timestamped strings), final_url, status.

ENDPOINTS (implement as workflow-backed APIs)
A) POST /api/onboard
Input: {company_name, website_url, docs_urls_optional[], agent_name, tone, founder_email, demo_mode_bool}
Output: {company_id, slug, agentmail_address, twilio_number, demo_mode_bool}
Workflow:
1) Create company_id + slug; emit ActivityFeed("Onboarding started")
2) Browser Use: crawl website/docs (in demo_mode keep to 2-5 key pages; timeboxed)
3) Extract structured “CompanyKnowledge” from crawl (product summary, setup steps, key links, common issues)
4) Supermemory: store knowledge & facts as persistent memory scoped to company_id (namespace/containerTag = company_id)
5) AgentMail: create inbox for the agent identity; store address
6) Twilio: provision phone number (SMS); store number
7) Persist Companies/AgentIdentities/KnowledgeSources; emit ActivityFeed("Memory built"), ActivityFeed("Identity created"), ActivityFeed("Setup complete")

B) POST /api/widget/ask
Input: {company_id, question, requested_mode:"answer"|"show"}
Output:
- answer: {mode:"answer", answer_text, confidence, suggested_links[]}
- show: {mode:"show", answer_text, steps[], final_url, session_id, narration_script}
Workflow:
1) Retrieve relevant context:
   - Supermemory: company knowledge + prior learned Q/A + learned playbooks if matching question
2) AI Agent outputs STRICT JSON:
   {
     answer_text,
     confidence_0_to_1,
     suggested_links[],
     should_show_bool,
     matched_playbook_topic_optional,
     steps[],
     navigation_goal,
     narration_script
   }
3) If a LearnedPlaybook matches strongly:
   - return answer quickly with playbook steps and final_url; should_show_bool=false unless user requested show
4) If requested_mode="answer" AND should_show_bool=false:
   - log ConversationLogs; store useful Q/A into Supermemory as learned memory; emit ActivityFeed("Widget answered")
   - return answer schema
5) Else (SHOW MODE):
   - Start Browser Use session (purpose="guided_walkthrough"):
     navigate website/docs to demonstrate the answer; produce timestamped run_log[] and final_url
   - Persist BrowserRuns {session_id, run_log, final_url, status}
   - Persist/Update LearnedPlaybooks (topic, steps, final_url, narration_script, evidence_links, last_verified_at=now)
   - Emit ActivityFeed("Guided walkthrough executed", session_id)
   - log ConversationLogs; return show schema

C) GET /api/activity?company_id=
Return ActivityFeed[] newest first

D) GET /api/browser/run?session_id=
Return BrowserRuns

E) POST /api/demo/community_event  (demo-safe trigger)
Input: {company_id, platform:"discord"|"slack", channel, user_id, message_text}
Output: {status:"ok"}
Workflow: route into responder and simulate sending if real integration not connected; emit ActivityFeed.

F) POST /api/community/respond (real webhook target if available)
Input: {company_id, platform, channel, user_id, message_text}
Output: {status:"ok"}
Workflow:
1) Allowlist channels (Integrations)
2) Supermemory context retrieval + playbook match
3) AI Agent strict JSON: {answer_text, confidence, escalation_bool, escalation_reason, suggested_links[]}
4) If confidence>=0.75 and not escalation -> send reply (or simulate); emit ActivityFeed("Answered community question")
5) Else -> AgentMail escalation email to founder_email with draft answer + context; emit ActivityFeed("Escalated to founder")
6) Store resolved Q/A into Supermemory (learned memory); optional update LearnedPlaybooks if it’s a repeatable fix.

G) POST /api/outreach/create (optional for demo)
Input: {company_id, goal, platform:"x"|"linkedin"|"both", demo_mode_bool}
Output: {task_id, status}
Guardrails: no DMs by default; max 5 actions; helpful tone.
Workflow: AI Agent makes plan_json (<=5 tasks) -> Browser Use executes (or simulates) -> persist OutreachTasks + ActivityFeed.

H) GET /api/outreach/status?task_id=
Return OutreachTasks

SAFETY/QUALITY RULES
- Never invent product facts. If context missing: ask one clarifying question OR escalate.
- Billing/security/legal -> escalate.
- Always produce concise answers + links.
- Always emit ActivityFeed.
- Always return deterministic JSON (no free-form blobs).


You are VibeFlow. Build the FRONTEND for “Calex” — AI DevRel Employee-as-a-Service — optimized for a YC hackathon demo.

GOAL
In <2 minutes, make judges believe: “This company just hired an AI DevRel employee and it’s working right now.”

KEY SURFACES
1) Founder Dashboard (activity + proof of work)
2) Onboarding wizard (hire your DevRel agent)
3) Hosted Help Page (/help/[companySlug]) that simulates “Calex installed on the company website”
4) Widget chat UI with “Answer” and “Show me”
5) Walkthrough modal that shows live Browser Use run_log + voice narration (use browser speech synthesis for reliability)
6) Optional Outreach runner

SPONSOR-ACCURATE LABELS (no incorrect claims)
- Browser Use = guided walkthrough automation + run logs
- Supermemory = persistent agent memory/context; stores company knowledge + learned Q/A + playbooks
- AgentMail = agent inbox identity + escalation emails
- Twilio = agent phone/SMS identity
- VibeFlow = workflows powering the APIs

STACK
Next.js + TypeScript + Tailwind. Dark-mode first. Minimal, clean UI.

ROUTES
- / (Landing)
- /demo (Judge-friendly launcher: pick “company” like Dedalus/Browser Use/AgentMail)
- /app/onboarding
- /app (Dashboard: metrics + live activity feed + watch modal + demo community trigger)
- /help/[companySlug] (Hosted help page with widget)
- /app/outreach (optional)

LANDING (/)
Headline: “Hire an AI DevRel.”
Sub: “Calex answers every question, guides developers through your docs live, and learns from every interaction.”
CTAs: “Create DevRel Agent” -> /app/onboarding, “See Demo” -> /demo
Include sponsor strip.

ONBOARDING (/app/onboarding)
Inputs:
- company_name, website_url, docs_urls (optional), agent_name, tone, founder_email
- DEMO MODE toggle (default ON)
Call POST /api/onboard
Show progress messages (crawling, memory, inbox, number).
Success screen shows company_id, slug, agentmail, twilio number.
Buttons: “Open Dashboard” and “Open Help Page”.

DASHBOARD (/app)
- Metric cards (can derive from ActivityFeed counts):
  Questions answered today, Walkthroughs today, Escalations, Response speed
- Live Activity Feed:
  GET /api/activity?company_id= (poll every 2-3s)
- Each Activity item:
  icon + title + time + status
  if session_id exists: “Watch” button opens WalkthroughModal
- Demo buttons (for reliability):
  “Trigger Discord/Slack Question (demo)” -> POST /api/demo/community_event

WALKTHROUGH MODAL
Input: session_id
Fetch: GET /api/browser/run?session_id=
Render:
- run_log as a live list
- final_url clickable
- narration_script (if returned from /api/widget/ask show mode)
Button: “Play narration” using browser SpeechSynthesis (do not rely on external TTS services).

HOSTED HELP PAGE (/help/[companySlug])
This simulates “Calex embedded on the company website” without needing real embed.
Page layout:
- left: company header (name + links)
- right/bottom: CalexWidgetChat component
Widget behavior:
- question input
- two buttons: “Answer” and “Show me”
Calls POST /api/widget/ask with requested_mode
Render:
- answer_text + suggested_links
If show mode:
- steps list + final_url + session_id
- automatically open WalkthroughModal + start polling browser run data.

DEMO PAGE (/demo)
Provide 3 quick actions:
- “Demo as Dedalus Labs”
- “Demo as Browser Use”
- “Demo as AgentMail”
Either:
- auto-run onboarding in demo mode (prefilled), or
- select an existing demo company_id/slug, then route to /help/[slug].

OPTIONAL OUTREACH PAGE (/app/outreach)
Form: goal + platform + demo toggle
Call /api/outreach/create then poll /api/outreach/status
Render artifacts and also rely on ActivityFeed updates.

COMPONENTS
- ActivityFeed
- ActivityItem
- MetricCard
- CalexWidgetChat
- WalkthroughModal
- OnboardingWizard

API CONTRACTS
Use:
POST /api/onboard
GET /api/activity
POST /api/widget/ask
GET /api/browser/run
POST /api/demo/community_event
(optional) outreach endpoints

DEMO UX MUST-HAVES
- Always show “Calex is working…” loading states
- Activity feed updates after every action
- “Show me” must feel magical even without screenshots; run_log + narration is enough