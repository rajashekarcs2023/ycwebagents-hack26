"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CalexWidgetChat } from "@/components/calex-widget-chat"

export default function EmbeddableWidgetPage() {
  const params = useParams()
  const companySlug = params.companySlug as string
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")

  useEffect(() => {
    // Fetch company info from backend by slug
    async function fetchCompany() {
      try {
        const res = await fetch(
          `http://localhost:3001/api/company?slug=${companySlug}`
        )
        if (res.ok) {
          const data = await res.json()
          setCompanyId(data.company.company_id)
          setCompanyName(data.company.name)
        }
      } catch {
        console.error("Failed to fetch company info")
      }
    }
    fetchCompany()
  }, [companySlug])

  if (!companyId) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-[#0a0a12]">
      <CalexWidgetChat
        companyId={companyId}
        companyName={companyName}
      />
    </div>
  )
}
