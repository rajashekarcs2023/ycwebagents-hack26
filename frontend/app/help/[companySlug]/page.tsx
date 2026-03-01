"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { CalexWidgetChat } from "@/components/calex-widget-chat"
import { Zap, Building2 } from "lucide-react"

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-foreground">No agent found for this company.</p>
          <Link
            href="/app/onboarding"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Create an Agent
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Calex</span>
            </Link>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {companyName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground text-balance">
            How can we help?
          </h1>
          <p className="text-sm text-muted-foreground">
            Ask anything about {companyName}. Try{" "}
            <span className="text-accent">{'"Show Me"'}</span> for a live walkthrough.
          </p>
        </div>
        <div className="flex-1" style={{ minHeight: "500px" }}>
          <CalexWidgetChat companyId={companyId} companyName={companyName} />
        </div>
      </main>
    </div>
  )
}
