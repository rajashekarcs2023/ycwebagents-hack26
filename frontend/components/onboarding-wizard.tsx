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
  Sparkles,
  Mail,
  Phone,
  Zap,
} from "lucide-react"
import type { OnboardResponse } from "@/lib/api"

const PROGRESS_STEPS = [
  { label: "Crawling website & docs...", icon: Globe },
  { label: "Building knowledge supermemory...", icon: Sparkles },
  { label: "Creating email identity...", icon: Mail },
  { label: "Setting up voice & phone...", icon: Phone },
  { label: "Your DevRel agent is live!", icon: Zap },
]

const INPUT_CLASS =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-violet-500/30 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all"

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [progressIndex, setProgressIndex] = useState(0)
  const [result, setResult] = useState<OnboardResponse | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const [companyName, setCompanyName] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [docsUrls, setDocsUrls] = useState("")
  const [founderEmail, setFounderEmail] = useState("")

  const [agentName, setAgentName] = useState("Calex")
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
      alert("Onboarding failed. Please make sure the backend is running on localhost:3001.")
    }
  }

  // Loading / Progress State
  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="mb-10">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
        </div>
        <div className="flex flex-col gap-4">
          {PROGRESS_STEPS.map(({ label, icon: Icon }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 transition-all duration-500 ${
                i <= progressIndex
                  ? "text-foreground opacity-100"
                  : "text-muted-foreground/30 opacity-50"
              }`}
            >
              {i < progressIndex ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Check className="h-4 w-4 text-emerald-500" />
                </div>
              ) : i === progressIndex ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                </div>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="h-4 w-4 text-muted-foreground/30" />
                </div>
              )}
              <span className="text-sm font-medium">{label}</span>
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
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 animate-count-up">
          <Check className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          {agentName} is live!
        </h2>
        <p className="mb-8 text-muted-foreground">
          Your AI DevRel for <span className="font-semibold text-foreground">{companyName}</span> is ready to answer developer questions.
        </p>

        <div className="mb-8 w-full max-w-md space-y-3">
          {/* Email */}
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">AgentMail Address</p>
              <p className="text-sm font-semibold text-foreground font-mono">
                {result.agentmail_address}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(result.agentmail_address, "email")}
              className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
            >
              {copied === "email" ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Vapi Phone Number</p>
              <p className="text-sm font-semibold text-foreground font-mono">
                {result.vapi_phone_number}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(result.vapi_phone_number, "phone")}
              className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
            >
              {copied === "phone" ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/app")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]"
          >
            <LayoutDashboard className="h-4 w-4" />
            Open Dashboard
          </button>
          <button
            onClick={() => router.push(`/help/${result.slug}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-white/10"
          >
            <Globe className="h-4 w-4" />
            Try Help Page
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
        {[
          { num: 1, label: "Company" },
          { num: 2, label: "Agent" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-3">
            {i > 0 && (
              <div className={`h-px w-12 transition-colors ${step >= s.num ? "bg-violet-500/50" : "bg-white/10"}`} />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  step >= s.num
                    ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                    : "bg-white/5 text-muted-foreground"
                }`}
              >
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className={`text-xs font-medium ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-up">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <Building2 className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Company Info</h2>
              <p className="text-xs text-muted-foreground">Tell us about your company</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Browser Use"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Website URL *
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://browser-use.com"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Documentation URLs (comma-separated)
              </label>
              <textarea
                value={docsUrls}
                onChange={(e) => setDocsUrls(e.target.value)}
                placeholder="https://docs.browser-use.com, https://docs.cloud.browser-use.com"
                rows={2}
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Founder Email *
              </label>
              <input
                type="email"
                value={founderEmail}
                onChange={(e) => setFounderEmail(e.target.value)}
                placeholder="founder@browser-use.com"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50"
            >
              Next
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-up">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <Bot className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Agent Identity</h2>
              <p className="text-xs text-muted-foreground">Customize your AI DevRel</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Agent Name *
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Calex"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Tone
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["friendly", "professional", "casual", "technical"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-semibold capitalize transition-all ${
                      tone === t
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm"
                        : "border border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5">
              <div>
                <p className="text-sm font-semibold text-foreground">Demo Mode</p>
                <p className="text-[11px] text-muted-foreground">
                  Deterministic responses for reliable demos
                </p>
              </div>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`relative h-7 w-12 rounded-full transition-all ${
                  demoMode
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25"
                    : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                    demoMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-foreground transition-all hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canProceedStep2}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Create Agent
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
