"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { CalexWidgetChat } from "@/components/calex-widget-chat"
import { Zap, Building2, ArrowLeft, BarChart3 } from "lucide-react"

export default function HelpPage({ params }: { params: Promise<{ companySlug: string }> }) {
  const { companySlug } = use(params)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")

  useEffect(() => {
    const id = localStorage.getItem("calex_company_id")
    const name = localStorage.getItem("calex_company_name")
    if (id) {
      setCompanyId(id)
      setCompanyName(name || companySlug)
    }
  }, [companySlug])

  if (!companyId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background bg-grid">
        <div className="text-center rounded-2xl border border-white/5 bg-white/[0.02] p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
            <Zap className="h-7 w-7 text-violet-400" />
          </div>
          <p className="mb-2 text-lg font-semibold text-foreground">No agent found</p>
          <p className="mb-6 text-sm text-muted-foreground">Set up a Calex agent for this company first.</p>
          <Link
            href="/app/onboarding"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25"
          >
            Create an Agent
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
                <Zap className="h-4.5 w-4.5 text-white" />
              </div>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-semibold text-foreground">
                {companyName}
              </span>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400 ring-1 ring-violet-500/20">
                HELP
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-white/10"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-6">
        {/* Hero mini */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
            How can we help?
          </h1>
          <p className="text-sm text-muted-foreground">
            Ask anything about {companyName}. Try{" "}
            <span className="font-semibold text-violet-400">&ldquo;Show Me&rdquo;</span>{" "}
            for a live browser walkthrough.
          </p>
        </div>
        <div className="flex-1" style={{ minHeight: "500px" }}>
          <CalexWidgetChat companyId={companyId} companyName={companyName} />
        </div>
      </main>
    </div>
  )
}
