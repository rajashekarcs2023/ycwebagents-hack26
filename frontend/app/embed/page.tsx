"use client"

import { useState } from "react"
import Link from "next/link"
import { Zap, Copy, Check, Code, ArrowLeft, Globe } from "lucide-react"

const CONSOLE_SNIPPET = `window.CALEX_SLUG="browser-use";window.CALEX_HOST="http://localhost:3000";var s=document.createElement("script");s.src="http://localhost:3000/embed.js";document.head.appendChild(s);`

const BOOKMARKLET = `javascript:void(${encodeURIComponent(CONSOLE_SNIPPET)})`

export default function EmbedPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [slug, setSlug] = useState("browser-use")

  const consoleCode = CONSOLE_SNIPPET.replace("browser-use", slug)
  const bookmarkletCode = `javascript:void(${encodeURIComponent(consoleCode)})`

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Calex</span>
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-foreground hover:bg-white/5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-xs font-medium text-violet-300">
            <Code className="h-3.5 w-3.5" />
            Embed Widget
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
            Inject Calex on Any Website
          </h1>
          <p className="text-muted-foreground">
            Add the AI DevRel chat widget to any website during your demo.
          </p>
        </div>

        {/* Slug selector */}
        <div className="mb-8 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Company Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-violet-500/30 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
            placeholder="browser-use"
          />
        </div>

        {/* Method 1: Console */}
        <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Code className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Method 1: Browser Console</h3>
                <p className="text-[11px] text-muted-foreground">Best for quick demos</p>
              </div>
            </div>
            <button
              onClick={() => copy(consoleCode, "console")}
              className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
            >
              {copied === "console" ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <ol className="mb-4 space-y-1.5 text-xs text-muted-foreground">
            <li>1. Open any website (e.g. <span className="text-foreground font-mono">docs.browser-use.com</span>)</li>
            <li>2. Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-foreground">F12</kbd> to open DevTools &rarr; Console tab</li>
            <li>3. Paste the snippet below and press Enter</li>
          </ol>
          <div className="rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs text-emerald-400/80 break-all leading-relaxed">
            {consoleCode}
          </div>
        </div>

        {/* Method 2: Bookmarklet */}
        <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <Globe className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Method 2: Bookmarklet</h3>
              <p className="text-[11px] text-muted-foreground">One-click on any page</p>
            </div>
          </div>
          <ol className="mb-4 space-y-1.5 text-xs text-muted-foreground">
            <li>1. Drag this button to your bookmarks bar:</li>
          </ol>
          <div className="flex items-center gap-4">
            <a
              href={bookmarkletCode}
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 cursor-grab active:cursor-grabbing"
              draggable
            >
              <Zap className="h-4 w-4" />
              Calex AI
            </a>
            <span className="text-[11px] text-muted-foreground">&larr; drag to bookmarks bar</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50">
          The widget connects to your local Calex instance at localhost:3000.
          Make sure both frontend and backend are running.
        </p>
      </main>
    </div>
  )
}
