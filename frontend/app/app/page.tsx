"use client"

import { useEffect, useState } from "react"
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
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { ActivityFeed, useActivityMetrics } from "@/components/activity-feed"
import { WalkthroughModal } from "@/components/walkthrough-modal"
import { simulateCommunityEvent } from "@/lib/api"

export default function DashboardPage() {
  const router = useRouter()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [agentName, setAgentName] = useState("")
  const [walkthroughSession, setWalkthroughSession] = useState<string | null>(null)
  const [showSimulator, setShowSimulator] = useState(false)
  const [simPlatform, setSimPlatform] = useState<"discord" | "slack">("discord")
  const [simMessage, setSimMessage] = useState("")
  const [simLoading, setSimLoading] = useState(false)

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
}) {
  const metrics = useActivityMetrics(companyId)
  const slug = typeof window !== "undefined" ? localStorage.getItem("calex_slug") : null

  const handleSimulate = async () => {
    if (!simMessage.trim()) return
    setSimLoading(true)
    try {
      await simulateCommunityEvent(companyId, simPlatform, simMessage)
      setSimMessage("")
    } catch {
      alert("Simulation failed. Is the backend running?")
    } finally {
      setSimLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
            </Link>
            <div className="h-5 w-px bg-border" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Calex Dashboard
              </p>
              <p className="text-xs text-muted-foreground">
                {companyName} — {agentName}
              </p>
            </div>
          </div>
          {slug && (
            <Link
              href={`/help/${slug}`}
              className="rounded-lg border border-border px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-card"
            >
              View Help Page
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Metrics */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Questions Answered"
            value={metrics.questionsAnswered}
            icon={MessageSquare}
          />
          <MetricCard
            title="Walkthroughs Run"
            value={metrics.walkthroughsRun}
            icon={Globe}
          />
          <MetricCard
            title="Escalations"
            value={metrics.escalations}
            icon={AlertTriangle}
          />
          <MetricCard
            title="Avg Response Time"
            value={metrics.avgResponseTime}
            icon={Clock}
          />
        </div>

        {/* Activity Feed */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Live Activity
          </h2>
          <div className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
        </div>

        <ActivityFeed
          companyId={companyId}
          onWatch={(sessionId) => setWalkthroughSession(sessionId)}
        />

        {/* Simulator */}
        <div className="mt-8">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card"
          >
            <Hash className="h-4 w-4 text-primary" />
            Demo Triggers
            {showSimulator ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showSimulator && (
            <div className="mt-4 rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setSimPlatform("discord")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    simPlatform === "discord"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  Discord
                </button>
                <button
                  onClick={() => setSimPlatform("slack")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    simPlatform === "slack"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  Slack
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSimulate()
                  }}
                  placeholder={`Simulate a ${simPlatform} question...`}
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleSimulate}
                  disabled={simLoading || !simMessage.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Walkthrough Modal */}
      {walkthroughSession && (
        <WalkthroughModal
          sessionId={walkthroughSession}
          onClose={() => setWalkthroughSession(null)}
        />
      )}
    </div>
  )
}
