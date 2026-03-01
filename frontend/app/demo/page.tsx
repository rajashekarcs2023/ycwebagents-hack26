"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { onboard } from "@/lib/api"
import {
  Zap,
  ArrowLeft,
  Loader2,
  Globe,
  ArrowRight,
  Sparkles,
  Monitor,
  Mail,
  Check,
  Search,
  Brain,
  Phone,
} from "lucide-react"

const ONBOARD_STEPS = [
  { label: "Crawling website & docs...", icon: Search },
  { label: "Building knowledge with Supermemory...", icon: Brain },
  { label: "Creating AgentMail inbox...", icon: Mail },
  { label: "Setting up Vapi phone line...", icon: Phone },
  { label: "Your DevRel agent is live!", icon: Zap },
]

const DEMO_COMPANIES = [
  {
    name: "Browser Use",
    website: "https://browser-use.com",
    slug_prefix: "browser-use",
    docs: ["https://docs.browser-use.com/introduction", "https://docs.cloud.browser-use.com/introduction"],
    description: "Open-source AI browser automation framework. Lets agents control web browsers to complete tasks.",
    icon: Monitor,
    gradient: "from-violet-500/20 to-purple-500/20",
    featured: true,
  },
  {
    name: "AgentMail",
    website: "https://agentmail.to",
    slug_prefix: "agentmail",
    docs: ["https://docs.agentmail.to"],
    description: "Email infrastructure for AI agents. Create inboxes, send and receive emails programmatically.",
    icon: Mail,
    gradient: "from-blue-500/20 to-cyan-500/20",
    featured: false,
  },
  {
    name: "Supermemory",
    website: "https://supermemory.ai",
    slug_prefix: "supermemory",
    docs: ["https://supermemory.ai/docs"],
    description: "Memory infrastructure for AI. Store, search, and retrieve context across conversations.",
    icon: Sparkles,
    gradient: "from-emerald-500/20 to-green-500/20",
    featured: false,
  },
]

export default function DemoPage() {
  const router = useRouter()
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  const [progressStep, setProgressStep] = useState(0)
  const [onboardingCompany, setOnboardingCompany] = useState<string | null>(null)

  const handleLaunch = async (index: number) => {
    const company = DEMO_COMPANIES[index]
    setLoadingIndex(index)
    setOnboardingCompany(company.name)
    setProgressStep(0)

    // Always show the onboarding animation (even for cached companies)
    const stepInterval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev >= ONBOARD_STEPS.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 1400)

    try {
      const response = await onboard({
        company_name: company.name,
        website_url: company.website,
        docs_urls: company.docs,
        agent_name: "Calex",
        tone: "friendly",
        founder_email: "demo@calex.dev",
        demo_mode: true,
      })

      localStorage.setItem("calex_company_id", response.company_id)
      localStorage.setItem("calex_slug", response.slug)
      localStorage.setItem("calex_company_name", company.name)
      localStorage.setItem("calex_agent_name", "Calex")
      localStorage.setItem(`calex_demo_slug_${company.slug_prefix}`, response.slug)
      localStorage.setItem(`calex_demo_id_${company.slug_prefix}`, response.company_id)

      // Wait for animation to finish, then redirect
      clearInterval(stepInterval)
      setProgressStep(ONBOARD_STEPS.length - 1)
      await new Promise((r) => setTimeout(r, 1800))
      router.push(`/help/${response.slug}`)
    } catch {
      clearInterval(stepInterval)
      setOnboardingCompany(null)
      setLoadingIndex(null)
      alert("Failed to set up demo. Make sure the backend is running on localhost:3001.")
    }
  }

  // ── Full-screen onboarding progress overlay ──
  if (onboardingCompany && loadingIndex !== null) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background bg-grid">
        <div className="mb-10 text-center animate-fade-up">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-xl shadow-violet-500/30">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Setting up Calex for {onboardingCompany}
          </h2>
          <p className="text-sm text-muted-foreground">
            This usually takes a few seconds...
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          {ONBOARD_STEPS.map(({ label, icon: Icon }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3.5 transition-all duration-500 ${
                i <= progressStep
                  ? "text-foreground opacity-100"
                  : "text-muted-foreground/30 opacity-40"
              }`}
            >
              {i < progressStep ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Check className="h-4 w-4 text-emerald-500" />
                </div>
              ) : i === progressStep ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-4 w-4 text-muted-foreground/30" />
                </div>
              )}
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-10 w-full max-w-sm">
          <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${((progressStep + 1) / ONBOARD_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Calex</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-foreground hover:bg-white/5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 lg:py-20">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-xs font-medium text-violet-300">
            <Globe className="h-3.5 w-3.5" />
            Live Demo — Real API Calls
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            See Calex in Action
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Pick a YC company below. Calex will onboard it, crawl its docs, and
            become its AI DevRel — in seconds.
          </p>
        </div>

        {/* Company Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {DEMO_COMPANIES.map((company, i) => {
            const Icon = company.icon
            return (
              <div
                key={company.name}
                className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] ${
                  company.featured
                    ? "border-violet-500/30 bg-gradient-to-b from-violet-500/5 to-transparent shadow-lg shadow-violet-500/5"
                    : "border-white/5 bg-white/[0.02] hover:border-violet-500/20"
                }`}
              >
                {company.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-lg">
                    RECOMMENDED
                  </div>
                )}
                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${company.gradient}`}>
                  <Icon className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-foreground">
                  {company.name}
                </h3>
                <p className="mb-2 text-xs font-mono text-muted-foreground/70">
                  {company.website}
                </p>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {company.description}
                </p>
                <button
                  onClick={() => handleLaunch(i)}
                  disabled={loadingIndex !== null}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 ${
                    company.featured
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                      : "bg-white/5 text-foreground border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {loadingIndex === i ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up agent...
                    </>
                  ) : (
                    <>
                      Launch Demo
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-center text-sm text-muted-foreground/50">
          Each demo creates a real Calex agent with its own email, phone number, and knowledge base.
        </p>
      </main>
    </div>
  )
}
