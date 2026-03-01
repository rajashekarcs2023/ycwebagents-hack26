"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { onboard } from "@/lib/api"
import { Zap, ArrowLeft, Loader2, Globe, ArrowRight } from "lucide-react"

const DEMO_COMPANIES = [
  {
    name: "Dedalus Labs",
    website: "https://dedalus.dev",
    slug_prefix: "dedalus-labs",
  },
  {
    name: "Browser Use",
    website: "https://browser-use.com",
    slug_prefix: "browser-use",
  },
  {
    name: "AgentMail",
    website: "https://agentmail.dev",
    slug_prefix: "agentmail",
  },
]

export default function DemoPage() {
  const router = useRouter()
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)

  const handleLaunch = async (index: number) => {
    const company = DEMO_COMPANIES[index]

    // Check if already onboarded
    const savedSlug = localStorage.getItem(`calex_demo_slug_${company.slug_prefix}`)
    const savedCompanyId = localStorage.getItem(`calex_demo_id_${company.slug_prefix}`)
    if (savedSlug && savedCompanyId) {
      localStorage.setItem("calex_company_id", savedCompanyId)
      localStorage.setItem("calex_slug", savedSlug)
      localStorage.setItem("calex_company_name", company.name)
      localStorage.setItem("calex_agent_name", "Calex")
      router.push(`/help/${savedSlug}`)
      return
    }

    setLoadingIndex(index)
    try {
      const response = await onboard({
        company_name: company.name,
        website_url: company.website,
        docs_urls: [],
        agent_name: "Calex",
        tone: "friendly",
        founder_email: "demo@calex.dev",
        demo_mode: true,
      })

      // Store globally and per-demo
      localStorage.setItem("calex_company_id", response.company_id)
      localStorage.setItem("calex_slug", response.slug)
      localStorage.setItem("calex_company_name", company.name)
      localStorage.setItem("calex_agent_name", "Calex")
      localStorage.setItem(`calex_demo_slug_${company.slug_prefix}`, response.slug)
      localStorage.setItem(`calex_demo_id_${company.slug_prefix}`, response.company_id)

      router.push(`/help/${response.slug}`)
    } catch {
      alert("Failed to set up demo. Make sure the backend is running.")
    } finally {
      setLoadingIndex(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Calex</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-bold text-foreground text-balance">
            Try Calex — Live Demo
          </h1>
          <p className="text-muted-foreground">
            Pick a company to see Calex in action.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {DEMO_COMPANIES.map((company, i) => (
            <div
              key={company.name}
              className="flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold text-foreground">
                {company.name}
              </h3>
              <p className="mb-6 text-xs text-muted-foreground">
                {company.website}
              </p>
              <button
                onClick={() => handleLaunch(i)}
                disabled={loadingIndex !== null}
                className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loadingIndex === i ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Launch Demo
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
