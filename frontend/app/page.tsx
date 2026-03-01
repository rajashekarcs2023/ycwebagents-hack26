import Link from "next/link"
import {
  MessageSquare,
  Globe,
  Hash,
  Brain,
  ArrowRight,
  Play,
  Zap,
  Phone,
  Mail,
  Shield,
  BarChart3,
  Sparkles,
  Bot,
  Monitor,
} from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "Instant Answers",
    description:
      "Answers from your docs, knowledge base, and past conversations. Sub-second response, 24/7.",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
  {
    icon: Monitor,
    title: '"Show Me" Walkthroughs',
    description:
      "AI opens a real browser, navigates your product, and shows developers exactly how — step by step.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Hash,
    title: "Community Monitoring",
    description:
      "Watches Discord & Slack 24/7. Answers questions automatically. Escalates what it can't handle.",
    gradient: "from-emerald-500/20 to-green-500/20",
  },
  {
    icon: Brain,
    title: "Learns Everything",
    description:
      "Ingests your docs, llms.txt, GitHub repos. Builds a supermemory that gets smarter over time.",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: Phone,
    title: "Voice & Phone",
    description:
      "Gets its own phone number and voice. Developers can literally call your AI DevRel for help.",
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    icon: Mail,
    title: "Email Identity",
    description:
      "Gets a real email inbox. Receives and responds to developer emails. Escalates to your founder.",
    gradient: "from-indigo-500/20 to-violet-500/20",
  },
]

const integrations = [
  { name: "Browser Use", desc: "Live walkthroughs", icon: Globe },
  { name: "Supermemory", desc: "Knowledge & memory", icon: Brain },
  { name: "AgentMail", desc: "Email identity", icon: Mail },
  { name: "Vapi", desc: "Voice & phone", icon: Phone },
  { name: "MiniMax", desc: "TTS narration", icon: Sparkles },
  { name: "Composio", desc: "1000+ tools", icon: Shield },
  { name: "OpenAI", desc: "Intelligence", icon: Bot },
  { name: "Discord", desc: "Community bot", icon: Hash },
]

const stats = [
  { value: "< 2s", label: "Avg response time" },
  { value: "8+", label: "Real API integrations" },
  { value: "24/7", label: "Always online" },
  { value: "∞", label: "Developer questions" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Calex
            </span>
            <span className="ml-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400 ring-1 ring-violet-500/20">
              BETA
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/demo"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-white/5"
            >
              Live Demo
            </Link>
            <Link
              href="/app"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-white/5"
            >
              Dashboard
            </Link>
            <Link
              href="/app/onboarding"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-transparent blur-3xl" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 text-center lg:pt-32 lg:pb-32">
            <div className="mx-auto max-w-4xl">
              {/* Badge */}
              <div className="animate-fade-up mb-8 inline-flex items-center gap-2.5 rounded-full border border-violet-500/20 bg-violet-500/5 px-5 py-2 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-violet-300 font-medium">Built at YC Hackathon 2026</span>
              </div>

              {/* Heading */}
              <h1 className="animate-fade-up stagger-1 mb-6 text-5xl font-extrabold tracking-tight leading-[1.1] lg:text-7xl xl:text-8xl">
                <span className="text-gradient-hero">Your AI</span>
                <br />
                <span className="text-gradient">DevRel Employee</span>
              </h1>

              {/* Subheading */}
              <p className="animate-fade-up stagger-2 mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
                Calex answers every developer question instantly, gives live
                &ldquo;Show Me&rdquo; walkthroughs of your product, monitors your
                community 24/7, and learns from every interaction.
              </p>

              {/* CTAs */}
              <div className="animate-fade-up stagger-3 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/app/onboarding"
                  className="group relative inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]"
                >
                  Create Your Agent
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/demo"
                  className="group inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-white/10 hover:border-white/20"
                >
                  <Play className="h-4 w-4 text-violet-400" />
                  Watch Live Demo
                </Link>
              </div>
            </div>

            {/* Stats bar */}
            <div className="animate-fade-up stagger-4 mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
                  <p className="text-2xl font-bold text-gradient lg:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">
                Capabilities
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                Everything a DevRel does.
                <br />
                <span className="text-muted-foreground">Automated.</span>
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className={`animate-fade-up stagger-${i + 1} group relative rounded-2xl border border-white/5 bg-white/[0.02] p-7 transition-all duration-300 hover:border-violet-500/20 hover:bg-white/[0.04]`}
                >
                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                    <feature.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
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

        {/* How it works */}
        <section className="relative border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">
                How It Works
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                Three steps to your AI DevRel
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Onboard",
                  desc: "Give Calex your website URL and docs. It crawls everything, reads your llms.txt, and builds a knowledge supermemory.",
                },
                {
                  step: "02",
                  title: "Deploy",
                  desc: "Calex gets its own email, phone number, and voice. Embed the widget on your site or connect your Discord.",
                },
                {
                  step: "03",
                  title: "Watch it work",
                  desc: "Developers ask questions, get instant answers and live walkthroughs. You watch from the dashboard as Calex handles everything.",
                },
              ].map((item, i) => (
                <div key={item.step} className="relative">
                  <div className="mb-5 text-5xl font-black text-violet-500/10">
                    {item.step}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 right-0 translate-x-1/2">
                      <ArrowRight className="h-5 w-5 text-violet-500/20" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="relative border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">
                Integrations
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                Powered by the best
              </h2>
              <p className="mt-4 text-muted-foreground">
                Real integrations, not mocks. Every API call is live.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {integrations.map((item) => (
                <div
                  key={item.name}
                  className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-violet-500/20 hover:bg-white/[0.04]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                    <item.icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
            <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-transparent p-12 text-center lg:p-20">
              <div className="absolute inset-0 bg-grid opacity-50" />
              <div className="relative">
                <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-5xl">
                  Ready to hire your AI DevRel?
                </h2>
                <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
                  Set up in 2 minutes. No credit card. Calex starts answering
                  developer questions immediately.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/app/onboarding"
                    className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-white/10"
                  >
                    <Play className="h-4 w-4 text-violet-400" />
                    Try Demo First
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">
                Calex
              </span>
            </div>
            <p className="text-xs text-muted-foreground/50">
              Built with ♥ at YC Hackathon 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
