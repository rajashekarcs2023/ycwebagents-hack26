"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  MessageSquare,
  Globe,
  AlertTriangle,
  Clock,
  Zap,
  Hash,
  Send,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bot,
  Activity,
  Sparkles,
} from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { ActivityFeed, useActivityMetrics } from "@/components/activity-feed"
import { WalkthroughModal } from "@/components/walkthrough-modal"
import { simulateCommunityEvent, generateLinkedInPost, postToLinkedIn, authorizeComposio, extractLeads, scheduleMeeting, logLeadToSheet, generateLinkedInFromSlack, getAgentMailInbox, sendAgentMail, triggerAutoReply, dashboardChat, triggerDailyResearch, getResearchStatus, type Lead, type AgentMailMessage } from "@/lib/api"
import { Linkedin, RefreshCw, CheckCircle2, Link2, Users, Calendar, FileSpreadsheet, Star, ArrowRight, Mail, Inbox, SendHorizontal, MessageSquareText, MessageCircle, Search, X } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [agentName, setAgentName] = useState("")
  const [walkthroughSession, setWalkthroughSession] = useState<string | null>(null)
  const [showSimulator, setShowSimulator] = useState(true)
  const [simPlatform, setSimPlatform] = useState<"discord" | "slack">("discord")
  const [simMessage, setSimMessage] = useState("")
  const [simLoading, setSimLoading] = useState(false)
  const [simResult, setSimResult] = useState<string | null>(null)
  const [linkedinDraft, setLinkedinDraft] = useState<string | null>(null)
  const [linkedinLoading, setLinkedinLoading] = useState(false)
  const [linkedinPosted, setLinkedinPosted] = useState(false)
  const [linkedinTopic, setLinkedinTopic] = useState("")
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsSummary, setLeadsSummary] = useState("")
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [sheetId, setSheetId] = useState("")
  const [schedulingLead, setSchedulingLead] = useState<string | null>(null)
  const [slackChannel, setSlackChannel] = useState("all-calexai")
  const [slackLinkedinLoading, setSlackLinkedinLoading] = useState(false)
  const [slackLinkedinDraft, setSlackLinkedinDraft] = useState<string | null>(null)
  const [slackLinkedinPosted, setSlackLinkedinPosted] = useState(false)
  const [mailMessages, setMailMessages] = useState<AgentMailMessage[]>([])
  const [mailInbox, setMailInbox] = useState<string | null>(null)
  const [mailLoading, setMailLoading] = useState(false)
  const [mailTo, setMailTo] = useState("")
  const [mailSubject, setMailSubject] = useState("")
  const [mailBody, setMailBody] = useState("")
  const [mailSending, setMailSending] = useState(false)
  const [autoReplying, setAutoReplying] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem("calex_company_id")
    if (!id) {
      router.push("/app/onboarding")
      return
    }
    setCompanyId(id)
    setCompanyName(localStorage.getItem("calex_company_name") || "")
    setAgentName(localStorage.getItem("calex_agent_name") || "Calex")
  }, [router])

  if (!companyId) return null

  return (
    <DashboardContent
      companyId={companyId}
      companyName={companyName}
      agentName={agentName}
      walkthroughSession={walkthroughSession}
      setWalkthroughSession={setWalkthroughSession}
      showSimulator={showSimulator}
      setShowSimulator={setShowSimulator}
      simPlatform={simPlatform}
      setSimPlatform={setSimPlatform}
      simMessage={simMessage}
      setSimMessage={setSimMessage}
      simLoading={simLoading}
      setSimLoading={setSimLoading}
      simResult={simResult}
      setSimResult={setSimResult}
      linkedinDraft={linkedinDraft}
      setLinkedinDraft={setLinkedinDraft}
      linkedinLoading={linkedinLoading}
      setLinkedinLoading={setLinkedinLoading}
      linkedinPosted={linkedinPosted}
      setLinkedinPosted={setLinkedinPosted}
      linkedinTopic={linkedinTopic}
      setLinkedinTopic={setLinkedinTopic}
      leads={leads}
      setLeads={setLeads}
      leadsSummary={leadsSummary}
      setLeadsSummary={setLeadsSummary}
      leadsLoading={leadsLoading}
      setLeadsLoading={setLeadsLoading}
      sheetId={sheetId}
      setSheetId={setSheetId}
      schedulingLead={schedulingLead}
      setSchedulingLead={setSchedulingLead}
      slackChannel={slackChannel}
      setSlackChannel={setSlackChannel}
      slackLinkedinLoading={slackLinkedinLoading}
      setSlackLinkedinLoading={setSlackLinkedinLoading}
      slackLinkedinDraft={slackLinkedinDraft}
      setSlackLinkedinDraft={setSlackLinkedinDraft}
      slackLinkedinPosted={slackLinkedinPosted}
      setSlackLinkedinPosted={setSlackLinkedinPosted}
      mailMessages={mailMessages}
      setMailMessages={setMailMessages}
      mailInbox={mailInbox}
      setMailInbox={setMailInbox}
      mailLoading={mailLoading}
      setMailLoading={setMailLoading}
      mailTo={mailTo}
      setMailTo={setMailTo}
      mailSubject={mailSubject}
      setMailSubject={setMailSubject}
      mailBody={mailBody}
      setMailBody={setMailBody}
      mailSending={mailSending}
      setMailSending={setMailSending}
      autoReplying={autoReplying}
      setAutoReplying={setAutoReplying}
    />
  )
}

function DashboardContent({
  companyId,
  companyName,
  agentName,
  walkthroughSession,
  setWalkthroughSession,
  showSimulator,
  setShowSimulator,
  simPlatform,
  setSimPlatform,
  simMessage,
  setSimMessage,
  simLoading,
  setSimLoading,
  simResult,
  setSimResult,
  linkedinDraft,
  setLinkedinDraft,
  linkedinLoading,
  setLinkedinLoading,
  linkedinPosted,
  setLinkedinPosted,
  linkedinTopic,
  setLinkedinTopic,
  leads,
  setLeads,
  leadsSummary,
  setLeadsSummary,
  leadsLoading,
  setLeadsLoading,
  sheetId,
  setSheetId,
  schedulingLead,
  setSchedulingLead,
  slackChannel,
  setSlackChannel,
  slackLinkedinLoading,
  setSlackLinkedinLoading,
  slackLinkedinDraft,
  setSlackLinkedinDraft,
  slackLinkedinPosted,
  setSlackLinkedinPosted,
  mailMessages,
  setMailMessages,
  mailInbox,
  setMailInbox,
  mailLoading,
  setMailLoading,
  mailTo,
  setMailTo,
  mailSubject,
  setMailSubject,
  mailBody,
  setMailBody,
  mailSending,
  setMailSending,
  autoReplying,
  setAutoReplying,
}: {
  companyId: string
  companyName: string
  agentName: string
  walkthroughSession: string | null
  setWalkthroughSession: (s: string | null) => void
  showSimulator: boolean
  setShowSimulator: (b: boolean) => void
  simPlatform: "discord" | "slack"
  setSimPlatform: (p: "discord" | "slack") => void
  simMessage: string
  setSimMessage: (s: string) => void
  simLoading: boolean
  setSimLoading: (b: boolean) => void
  simResult: string | null
  setSimResult: (s: string | null) => void
  linkedinDraft: string | null
  setLinkedinDraft: (s: string | null) => void
  linkedinLoading: boolean
  setLinkedinLoading: (b: boolean) => void
  linkedinPosted: boolean
  setLinkedinPosted: (b: boolean) => void
  linkedinTopic: string
  setLinkedinTopic: (s: string) => void
  leads: Lead[]
  setLeads: (l: Lead[]) => void
  leadsSummary: string
  setLeadsSummary: (s: string) => void
  leadsLoading: boolean
  setLeadsLoading: (b: boolean) => void
  sheetId: string
  setSheetId: (s: string) => void
  schedulingLead: string | null
  setSchedulingLead: (s: string | null) => void
  slackChannel: string
  setSlackChannel: (s: string) => void
  slackLinkedinLoading: boolean
  setSlackLinkedinLoading: (b: boolean) => void
  slackLinkedinDraft: string | null
  setSlackLinkedinDraft: (s: string | null) => void
  slackLinkedinPosted: boolean
  setSlackLinkedinPosted: (b: boolean) => void
  mailMessages: AgentMailMessage[]
  setMailMessages: (m: AgentMailMessage[]) => void
  mailInbox: string | null
  setMailInbox: (s: string | null) => void
  mailLoading: boolean
  setMailLoading: (b: boolean) => void
  mailTo: string
  setMailTo: (s: string) => void
  mailSubject: string
  setMailSubject: (s: string) => void
  mailBody: string
  setMailBody: (s: string) => void
  mailSending: boolean
  setMailSending: (b: boolean) => void
  autoReplying: boolean
  setAutoReplying: (b: boolean) => void
}) {
  const metrics = useActivityMetrics(companyId)
  const slug = typeof window !== "undefined" ? localStorage.getItem("calex_slug") : null
  const [showLeads, setShowLeads] = useState(true)
  const [researchStatus, setResearchStatus] = useState<string>("idle")
  const [researchLog, setResearchLog] = useState<string[]>([])
  const [researchResult, setResearchResult] = useState<string | null>(null)

  const handleRunResearch = async () => {
    setResearchStatus("running")
    setResearchLog(["Starting live research..."])
    setResearchResult(null)
    try {
      await triggerDailyResearch(companyId)
      // Poll for status
      const poll = setInterval(async () => {
        try {
          const s = await getResearchStatus(companyId)
          setResearchLog(s.log || [])
          if (s.status !== "running") {
            clearInterval(poll)
            setResearchStatus(s.status)
            setResearchResult(s.result)
          }
        } catch { /* ignore */ }
      }, 3000)
    } catch {
      setResearchStatus("error")
      setResearchLog(["Failed to start research"])
    }
  }

  const handleSimulate = async () => {
    if (!simMessage.trim()) return
    setSimLoading(true)
    setSimResult(null)
    try {
      const res = await simulateCommunityEvent(companyId, simPlatform, simMessage)
      setSimResult(res.answer_text || "Response sent")
      setSimMessage("")
    } catch {
      setSimResult("Failed — is the backend running?")
    } finally {
      setSimLoading(false)
    }
  }

  const handleGenerateLinkedIn = async () => {
    setLinkedinLoading(true)
    setLinkedinDraft(null)
    setLinkedinPosted(false)
    try {
      const res = await generateLinkedInPost(companyId, linkedinTopic)
      setLinkedinDraft(res.post_text + "\n\n" + res.hashtags.join(" "))
    } catch {
      setLinkedinDraft("Failed to generate — is the backend running?")
    } finally {
      setLinkedinLoading(false)
    }
  }

  const handlePostLinkedIn = async () => {
    if (!linkedinDraft) return
    setLinkedinLoading(true)
    try {
      await postToLinkedIn(companyId, linkedinDraft)
      setLinkedinPosted(true)
    } catch {
      alert("LinkedIn posting failed. Make sure LinkedIn is connected via Composio.")
    } finally {
      setLinkedinLoading(false)
    }
  }

  const handleConnectLinkedIn = async () => {
    try {
      const res = await authorizeComposio(companyId, "linkedin")
      if (res.redirect_url) {
        window.open(res.redirect_url, "_blank")
      }
    } catch {
      alert("Failed to start LinkedIn authorization.")
    }
  }

  const handleExtractLeads = async () => {
    setLeadsLoading(true)
    try {
      const res = await extractLeads(companyId)
      setLeads(res.leads)
      setLeadsSummary(res.summary)
    } catch {
      setLeadsSummary("Failed to extract leads — is the backend running?")
    } finally {
      setLeadsLoading(false)
    }
  }

  const handleScheduleMeeting = (lead: Lead) => {
    setSchedulingLead(lead.name)
    // Generate a Google Calendar event URL
    const now = new Date()
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000) // tomorrow
    start.setHours(10, 0, 0, 0)
    const end = new Date(start.getTime() + 30 * 60 * 1000) // 30 min
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(`Calex Follow-up: ${lead.name}`)}` +
      `&dates=${fmt(start)}/${fmt(end)}` +
      `&details=${encodeURIComponent(`Lead: ${lead.name}\nInterest: ${lead.interest}\nScore: ${lead.score}/10\nAction: ${lead.suggested_action}\n\nAuto-scheduled by Calex AI DevRel Agent`)}` +
      (lead.email ? `&add=${encodeURIComponent(lead.email)}` : "")
    window.open(calUrl, "_blank")
    setTimeout(() => setSchedulingLead(null), 1000)
  }

  const handleLogToSheet = (lead: Lead) => {
    // Open Google Sheets directly — for demo, open a new sheet
    if (sheetId.trim()) {
      window.open(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`, "_blank")
    } else {
      window.open("https://sheets.google.com/create", "_blank")
    }
  }

  const handleConnectGoogle = async (toolkit: string) => {
    try {
      const res = await authorizeComposio(companyId, toolkit)
      if (res.redirect_url) {
        window.open(res.redirect_url, "_blank")
      }
    } catch {
      alert(`Failed to start ${toolkit} authorization.`)
    }
  }

  // Auto-load daily LinkedIn recommendation on mount
  useEffect(() => {
    const loadDaily = async () => {
      // Auto-fetch leads
      setLeadsLoading(true)
      try {
        const lr = await extractLeads(companyId)
        setLeads(lr.leads)
        setLeadsSummary(lr.summary)
      } catch { /* silent */ }
      setLeadsLoading(false)

      // Auto-generate LinkedIn post from Slack
      setSlackLinkedinLoading(true)
      try {
        const res = await generateLinkedInFromSlack(companyId, slackChannel)
        if (!res.error) {
          setSlackLinkedinDraft(res.post_text + "\n\n" + res.hashtags.join(" "))
        }
      } catch { /* silent */ }
      setSlackLinkedinLoading(false)

      // Auto-fetch mail
      try {
        const mr = await getAgentMailInbox(companyId)
        setMailInbox(mr.inbox)
        setMailMessages(mr.messages)
      } catch { /* silent */ }
    }
    loadDaily()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  const handlePostSlackLinkedIn = () => {
    if (!slackLinkedinDraft) return
    // Open LinkedIn share dialog with pre-filled content
    const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(slackLinkedinDraft)}`
    window.open(shareUrl, "_blank")
    setSlackLinkedinPosted(true)
  }

  const handleFetchMail = async () => {
    setMailLoading(true)
    try {
      const res = await getAgentMailInbox(companyId)
      setMailInbox(res.inbox)
      setMailMessages(res.messages)
    } catch {
      setMailMessages([])
    } finally {
      setMailLoading(false)
    }
  }

  const handleAutoReply = async () => {
    setAutoReplying(true)
    try {
      await triggerAutoReply(companyId)
      // Refresh inbox after a delay to show replies
      setTimeout(async () => {
        try {
          const mr = await getAgentMailInbox(companyId)
          setMailMessages(mr.messages)
        } catch { /* silent */ }
        setAutoReplying(false)
      }, 5000)
    } catch {
      alert("Auto-reply failed.")
      setAutoReplying(false)
    }
  }

  const handleSendMail = async () => {
    if (!mailTo || !mailSubject) return
    setMailSending(true)
    try {
      await sendAgentMail(companyId, mailTo, mailSubject, mailBody)
      setMailTo("")
      setMailSubject("")
      setMailBody("")
      handleFetchMail()
    } catch {
      alert("Email send failed.")
    } finally {
      setMailSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
                <Zap className="h-4.5 w-4.5 text-white" />
              </div>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-foreground">
                  {companyName}
                </p>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                  ACTIVE
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Agent: {agentName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {slug && (
              <Link
                href={`/help/${slug}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground transition-all hover:bg-white/10"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Help Page
              </Link>
            )}
            <Link
              href="/embed"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground transition-all hover:bg-white/10"
            >
              <Globe className="h-3.5 w-3.5" />
              Embed
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Try Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Metrics */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Questions Answered"
            value={metrics.questionsAnswered}
            icon={MessageSquare}
            color="violet"
          />
          <MetricCard
            title="Walkthroughs Run"
            value={metrics.walkthroughsRun}
            icon={Globe}
            color="blue"
          />
          <MetricCard
            title="Escalations"
            value={metrics.escalations}
            icon={AlertTriangle}
            color="amber"
          />
          <MetricCard
            title="Avg Response Time"
            value={metrics.avgResponseTime}
            icon={Clock}
            color="emerald"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Feed — takes 2 cols */}
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="h-5 w-5 text-violet-400" />
                <h2 className="text-lg font-bold text-foreground">
                  Live Activity
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-sm text-muted-foreground">Real-time</span>
              </div>
            </div>

            <ActivityFeed
              companyId={companyId}
              onWatch={(sessionId) => setWalkthroughSession(sessionId)}
            />
          </div>

          {/* Right sidebar — Simulator */}
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
            <div>
              <button
                onClick={() => setShowSimulator(!showSimulator)}
                className="mb-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-base font-semibold text-foreground transition-all hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="h-4.5 w-4.5 text-violet-400" />
                  Community Simulator
                </div>
                {showSimulator ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {showSimulator && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Simulate a community question. Calex will respond in real-time and post to Discord.
                  </p>

                  {/* Platform tabs */}
                  <div className="mb-4 flex rounded-lg bg-white/5 p-0.5">
                    {(["discord", "slack"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setSimPlatform(p)}
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold capitalize transition-all ${
                          simPlatform === p
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Quick questions */}
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {[
                      "How do I get started?",
                      "What's the pricing?",
                      "Python quickstart?",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setSimMessage(q)}
                        className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-violet-500/20 hover:text-foreground"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={simMessage}
                      onChange={(e) => setSimMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSimulate()
                      }}
                      placeholder="Type a question..."
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-violet-500/30 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                    />
                    <button
                      onClick={handleSimulate}
                      disabled={simLoading || !simMessage.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50"
                    >
                      {simLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Result */}
                  {simResult && (
                    <div className="mt-3 rounded-xl border border-violet-500/10 bg-violet-500/5 p-3">
                      <p className="text-xs font-semibold text-violet-400 mb-1">Calex responded:</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{simResult}</p>
                    </div>
                  )}
                </div>
              )}

              {/* LinkedIn connection (hidden, triggered by Daily Post) */}
              <button
                onClick={handleConnectLinkedIn}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-[10px] font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-white/5"
              >
                <Link2 className="h-3 w-3" />
                Connect LinkedIn
              </button>

              {/* ── Live Research (Browser Use OSS) ── */}
              <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Search className="h-4.5 w-4.5 text-emerald-400" />
                    <span className="text-sm font-semibold text-foreground">Live Research</span>
                  </div>
                  {researchStatus === "running" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Running
                    </span>
                  )}
                  {researchStatus === "completed" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Done
                    </span>
                  )}
                </div>

                <p className="mb-3 text-[11px] text-muted-foreground">
                  Opens a live browser to scan GitHub, Reddit, and HN for leads and community signals.
                </p>

                <button
                  onClick={handleRunResearch}
                  disabled={researchStatus === "running"}
                  className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50"
                >
                  {researchStatus === "running" ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Browser running...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" />
                      Run Live Research
                    </>
                  )}
                </button>

                {/* Live log */}
                {researchLog.length > 0 && (
                  <div className="rounded-xl border border-emerald-500/10 bg-black/30 p-3 font-mono text-[10px] text-emerald-400/80 max-h-32 overflow-y-auto">
                    {researchLog.map((line, i) => (
                      <div key={i} className="mb-0.5">&gt; {line}</div>
                    ))}
                  </div>
                )}

                {/* Result */}
                {researchResult && researchStatus === "completed" && (
                  <div className="mt-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3">
                    <p className="text-[10px] font-semibold text-emerald-400 mb-1">Research Report:</p>
                    <p className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{researchResult}</p>
                  </div>
                )}
              </div>

              {/* ── Today's Leads ── */}
              <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <button
                  onClick={() => setShowLeads(!showLeads)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4.5 w-4.5 text-amber-400" />
                    <span className="text-sm font-semibold text-foreground">Today&apos;s Leads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {leadsLoading ? (
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
                        <span className="text-[10px] text-muted-foreground">Scanning...</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-amber-500/20 px-2 text-xs font-bold text-amber-400">
                        {leads.length}
                      </span>
                    )}
                  </div>
                </button>

                {showLeads && leads.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[11px] text-amber-400/70 italic mb-1">{leadsSummary}</p>
                    {leads.map((lead, i) => (
                      <div key={i} className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-foreground">{lead.name}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, Math.ceil(lead.score / 2)) }).map((_, j) => (
                              <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="ml-1 text-[10px] text-muted-foreground">{lead.score}/10</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-2">{lead.interest}</p>
                        <p className="text-[10px] text-amber-400/70 mb-2">{lead.suggested_action}</p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleScheduleMeeting(lead)}
                            disabled={schedulingLead === lead.name}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-50"
                          >
                            {schedulingLead === lead.name ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Calendar className="h-3 w-3" />
                            )}
                            Schedule
                          </button>
                          <button
                            onClick={() => handleLogToSheet(lead)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
                          >
                            <FileSpreadsheet className="h-3 w-3" />
                            Log
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Daily Content Recommendation ── */}
              <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Linkedin className="h-4.5 w-4.5 text-blue-400" />
                    <span className="text-sm font-semibold text-foreground">Daily Post</span>
                  </div>
                  {slackLinkedinLoading ? (
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />
                      <span className="text-[10px] text-muted-foreground">Generating...</span>
                    </div>
                  ) : slackLinkedinDraft ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                      <Sparkles className="h-3 w-3" /> Ready
                    </span>
                  ) : null}
                </div>

                <p className="mb-3 text-[11px] text-muted-foreground">
                  Auto-generated from today&apos;s team conversations and community activity.
                </p>

                {slackLinkedinDraft && (
                  <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-3 animate-in fade-in duration-300">
                    <textarea
                      value={slackLinkedinDraft}
                      onChange={(e) => setSlackLinkedinDraft(e.target.value)}
                      rows={8}
                      className="mb-3 w-full resize-none rounded-lg bg-transparent text-xs text-foreground leading-relaxed focus:outline-none"
                    />
                    {slackLinkedinPosted ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        Posted to LinkedIn!
                      </div>
                    ) : (
                      <button
                        onClick={handlePostSlackLinkedIn}
                        disabled={slackLinkedinLoading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50"
                      >
                        <Linkedin className="h-3.5 w-3.5" />
                        Post to LinkedIn
                      </button>
                    )}
                  </div>
                )}

                {!slackLinkedinDraft && !slackLinkedinLoading && (
                  <p className="text-xs text-muted-foreground/50 italic text-center py-4">No post generated yet. Add messages to your team channel.</p>
                )}
              </div>

              {/* ── AgentMail ── */}
              <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4.5 w-4.5 text-cyan-400" />
                    <span className="text-base font-semibold text-foreground">Agent Email</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleAutoReply}
                      disabled={autoReplying}
                      className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-cyan-500/30 disabled:opacity-50"
                    >
                      {autoReplying ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      {autoReplying ? "Replying..." : "Auto-Reply All"}
                    </button>
                    <button
                      onClick={handleFetchMail}
                      disabled={mailLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-white/5"
                    >
                      {mailLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Inbox className="h-3 w-3" />}
                      Refresh
                    </button>
                  </div>
                </div>

                {mailInbox && (
                  <p className="mb-3 text-xs text-muted-foreground font-mono truncate">
                    Inbox: {mailInbox}
                  </p>
                )}

                {/* Compose */}
                <div className="mb-3 flex flex-col gap-2">
                  <input
                    type="email"
                    value={mailTo}
                    onChange={(e) => setMailTo(e.target.value)}
                    placeholder="To (e.g. rajashekarvennavelli@gmail.com)..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-cyan-500/30 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    placeholder="Subject..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-cyan-500/30 focus:outline-none"
                  />
                  <textarea
                    value={mailBody}
                    onChange={(e) => setMailBody(e.target.value)}
                    placeholder="Message body..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-cyan-500/30 focus:outline-none"
                  />
                  <button
                    onClick={handleSendMail}
                    disabled={mailSending || !mailTo || !mailSubject}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 disabled:opacity-50"
                  >
                    {mailSending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <SendHorizontal className="h-3.5 w-3.5" />}
                    Send Email
                  </button>
                </div>

                {/* Quick send to demo contacts */}
                <div className="mb-3 flex gap-1.5">
                  <button onClick={() => setMailTo("rajashekarvennavelli@gmail.com")} className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 text-[10px] text-cyan-400 hover:bg-cyan-500/10">
                    rajashekar...
                  </button>
                  <button onClick={() => setMailTo("chicostategac@gmail.com")} className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 text-[10px] text-cyan-400 hover:bg-cyan-500/10">
                    chicostategac...
                  </button>
                </div>

                {/* Messages list */}
                {mailMessages.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {mailMessages.map((msg, i) => (
                      <div key={i} className={`rounded-xl border p-3 ${msg.direction === "outbound" ? "border-cyan-500/10 bg-cyan-500/5" : "border-white/5 bg-white/[0.02]"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground truncate max-w-[60%]">
                            {msg.direction === "outbound" ? `→ ${msg.to}` : `← ${msg.from}`}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{msg.date ? new Date(msg.date).toLocaleDateString() : ""}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-0.5">{msg.subject}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {mailMessages.length === 0 && mailInbox && (
                  <p className="text-xs text-muted-foreground/60 italic text-center">No emails yet. Send one or wait for escalations.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Walkthrough Modal */}
      {walkthroughSession && (
        <WalkthroughModal
          sessionId={walkthroughSession!}
          onClose={() => setWalkthroughSession(null)}
        />
      )}

      {/* Floating Dashboard Chat Widget */}
      <DashboardChatWidget companyId={companyId} />
    </div>
  )
}

// ─── Floating Dashboard Chat Widget ───────────────────────────────────────

function DashboardChatWidget({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Hi! I'm your Calex dashboard assistant. Ask me about leads, conversations, activity, or anything about your DevRel data today." },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const q = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", text: q }])
    setLoading(true)
    try {
      const res = await dashboardChat(companyId, q)
      setMessages((prev) => [...prev, { role: "assistant", text: res.answer }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, something went wrong. Is the backend running?" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-2xl shadow-violet-500/40 transition-all hover:scale-105 hover:shadow-violet-500/60"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[380px] flex-col rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
              <Search className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Calex Insights</p>
              <p className="text-[10px] text-muted-foreground">Ask about leads, activity, conversations</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white"
                    : "border border-white/5 bg-white/[0.03] text-foreground"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {["What leads were found today?", "Any escalations?", "Summarize today's activity", "Who contacted us?"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-2 py-1 text-[10px] text-violet-400 hover:bg-violet-500/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/5 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your data..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-violet-500/30 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
