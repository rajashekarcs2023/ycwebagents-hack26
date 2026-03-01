import Link from "next/link"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { Zap, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Create Your DevRel Agent — Calex",
  description: "Set up your AI DevRel employee in under 2 minutes.",
}

export default function OnboardingPage() {
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

      <main className="mx-auto max-w-lg px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
            Create your AI DevRel
          </h1>
          <p className="text-muted-foreground">
            Set up takes less than 2 minutes. No credit card needed.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
          <OnboardingWizard />
        </div>
      </main>
    </div>
  )
}
