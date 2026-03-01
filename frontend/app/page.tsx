import Link from "next/link"
import {
  MessageSquare,
  Globe,
  Hash,
  Brain,
  ArrowRight,
  Play,
  Zap,
} from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "Answers Questions Instantly",
    description:
      "Your widget answers from company knowledge — no waiting for a human to get online.",
  },
  {
    icon: Globe,
    title: 'Live "Show Me" Walkthroughs',
    description:
      "AI navigates your site and shows developers step-by-step how to get things done.",
  },
  {
    icon: Hash,
    title: "Community Auto-Responder",
    description:
      "Monitors Discord and Slack channels, responds to questions, and escalates when needed.",
  },
  {
    icon: Brain,
    title: "Learns & Improves",
    description:
      "Builds playbooks from every resolved question. Gets smarter with every interaction.",
  },
]

const sponsors = [
  { name: "Browser Use", role: "Guided walkthrough automation" },
  { name: "Supermemory", role: "Persistent agent memory" },
  { name: "AgentMail", role: "Agent email identity" },
  { name: "Twilio", role: "Agent phone/SMS identity" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Calex</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/demo"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Demo
            </Link>
            <Link
              href="/app/onboarding"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-6xl px-6 py-24 text-center lg:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-success" />
              YC Hackathon Project
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground text-balance lg:text-7xl">
              Hire an AI DevRel.
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-muted-foreground text-balance lg:text-xl">
              Calex answers every developer question, guides them through your
              docs live, and learns from every interaction.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/app/onboarding"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create Your DevRel Agent
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card"
              >
                <Play className="h-4 w-4" />
                See Live Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
            <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
              What Calex Does
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sponsors */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="mb-8 text-center text-sm text-muted-foreground">
              Powered by
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.name}
                  className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-5 text-center"
                >
                  <p className="font-semibold text-foreground">
                    {sponsor.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sponsor.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                <Zap className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Calex
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Built for YC Hackathon 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
