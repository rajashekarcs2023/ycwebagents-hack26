"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { onboard } from "@/lib/api"
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Bot,
  Loader2,
  Check,
  Copy,
  Globe,
  LayoutDashboard,
} from "lucide-react"
import type { OnboardResponse } from "@/lib/api"

const PROGRESS_STEPS = [
  "Crawling website...",
  "Building knowledge memory...",
  "Creating email identity...",
  "Setting up phone number...",
  "Your DevRel agent is ready!",
]

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [progressIndex, setProgressIndex] = useState(0)
  const [result, setResult] = useState<OnboardResponse | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  // Step 1 fields
  const [companyName, setCompanyName] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [docsUrls, setDocsUrls] = useState("")
  const [founderEmail, setFounderEmail] = useState("")

  // Step 2 fields
  const [agentName, setAgentName] = useState("")
  const [tone, setTone] = useState("friendly")
  const [demoMode, setDemoMode] = useState(true)

  const canProceedStep1 = companyName && websiteUrl && founderEmail
  const canProceedStep2 = agentName

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setProgressIndex(0)

    // Animated progress steps
    const progressInterval = setInterval(() => {
      setProgressIndex((prev) => {
        if (prev >= PROGRESS_STEPS.length - 1) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 1
      })
    }, 2000)

    try {
      const docsArray = docsUrls
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean)

      const response = await onboard({
        company_name: companyName,
        website_url: websiteUrl,
        docs_urls: docsArray,
        agent_name: agentName,
        tone,
        founder_email: founderEmail,
        demo_mode: demoMode,
      })

      clearInterval(progressInterval)
      setProgressIndex(PROGRESS_STEPS.length - 1)

      // Store in localStorage
      localStorage.setItem("calex_company_id", response.company_id)
      localStorage.setItem("calex_slug", response.slug)
      localStorage.setItem("calex_company_name", companyName)
      localStorage.setItem("calex_agent_name", agentName)

      setTimeout(() => {
        setResult(response)
        setLoading(false)
      }, 1000)
    } catch {
      clearInterval(progressInterval)
      setLoading(false)
      alert("Onboarding failed. Please make sure the backend is running.")
    }
  }

  // Loading / Progress State
  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="mb-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <div className="flex flex-col gap-3">
          {PROGRESS_STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 transition-all duration-500 ${
                i <= progressIndex
                  ? "text-foreground opacity-100"
                  : "text-muted-foreground opacity-30"
              }`}
            >
              {i < progressIndex ? (
                <Check className="h-4 w-4 text-success" />
              ) : i === progressIndex ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-border" />
              )}
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Success State
  if (result) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          {agentName} is ready!
        </h2>
        <p className="mb-8 text-muted-foreground">
          Your DevRel agent for {companyName} has been set up.
        </p>

        <div className="mb-8 w-full max-w-md space-y-3">
          {/* Email */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">AgentMail Address</p>
              <p className="text-sm font-medium text-foreground">
                {result.agentmail_address}
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(result.agentmail_address, "email")
              }
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {copied === "email" ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Twilio Number</p>
              <p className="text-sm font-medium text-foreground">
                {result.twilio_number}
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(result.twilio_number, "phone")
              }
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {copied === "phone" ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/app")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <LayoutDashboard className="h-4 w-4" />
            Open Dashboard
          </button>
          <button
            onClick={() => router.push(`/help/${result.slug}`)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Globe className="h-4 w-4" />
            Open Help Page
          </button>
        </div>
      </div>
    )
  }

  // Form Steps
  return (
    <div>
      {/* Step Indicators */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
            step >= 1
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          1
        </div>
        <div className="h-px w-8 bg-border" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
            step >= 2
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          2
        </div>
      </div>

      {step === 1 && (
        <div className="animate-in fade-in duration-300">
          <div className="mb-6 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Company Info
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                Website URL *
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://acme.dev"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                Documentation URLs (optional, comma-separated)
              </label>
              <textarea
                value={docsUrls}
                onChange={(e) => setDocsUrls(e.target.value)}
                placeholder="https://docs.acme.dev, https://acme.dev/api"
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                Founder Email *
              </label>
              <input
                type="email"
                value={founderEmail}
                onChange={(e) => setFounderEmail(e.target.value)}
                placeholder="founder@acme.dev"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in duration-300">
          <div className="mb-6 flex items-center gap-3">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Agent Identity
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                Agent Name *
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Aria, Dev, Max..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ colorScheme: "dark" }}
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Demo Mode</p>
                <p className="text-xs text-muted-foreground">
                  Uses deterministic responses for reliable demos
                </p>
              </div>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  demoMode ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-primary-foreground transition-transform ${
                    demoMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canProceedStep2}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Create Agent
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
