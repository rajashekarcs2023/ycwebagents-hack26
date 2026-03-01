import Link from "next/link"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { Zap, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Create Your DevRel Agent — Calex",
  description: "Set up your AI DevRel employee in under 2 minutes.",
}

export default function OnboardingPage() {
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

      <main className="mx-auto max-w-lg px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground text-balance">
            Hire your DevRel agent
          </h1>
          <p className="text-muted-foreground">
            Set up takes less than 2 minutes.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8">
          <OnboardingWizard />
        </div>
      </main>
    </div>
  )
}
