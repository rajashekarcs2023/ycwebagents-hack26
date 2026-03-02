"use client"

import { useState, useRef, useEffect } from "react"
import {
  askWidget,
  type AskAnswerResponse,
  type AskShowResponse,
} from "@/lib/api"
import {
  Send,
  MessageSquare,
  Globe,
  ExternalLink,
  CheckCircle2,
  Bot,
  User,
  Sparkles,
  Monitor,
} from "lucide-react"
import { WalkthroughModal } from "@/components/walkthrough-modal"

interface Message {
  id: string
  role: "user" | "agent"
  content: string
  suggestedLinks?: string[]
  steps?: string[]
  finalUrl?: string
  sessionId?: string
  narrationScript?: string
  narrationAudioUrl?: string | null
  isNavigating?: boolean
}

interface CalexWidgetChatProps {
  companyId: string
  companyName?: string
}

function isEmbedded(): boolean {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

function sendToParent(message: Record<string, unknown>) {
  try {
    window.parent.postMessage({ source: "calex-widget", ...message }, "*")
  } catch {
    console.warn("[Calex] Cannot send message to parent frame")
  }
}

export function CalexWidgetChat({
  companyId,
  companyName,
}: CalexWidgetChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      content: `Hi! I'm Calex, your AI DevRel${
        companyName ? ` for ${companyName}` : ""
      }. Ask me anything — or say "Show Me" and I'll navigate you to the right page.`,
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [walkthroughSession, setWalkthroughSession] = useState<{
    sessionId: string
    narrationScript?: string
    narrationAudioUrl?: string | null
  } | null>(null)
  const [navigatingUrl, setNavigatingUrl] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const embedded = typeof window !== "undefined" ? isEmbedded() : false

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (mode: "answer" | "show") => {
    const question = input.trim()
    if (!question || loading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const response = await askWidget(companyId, question, mode)

      if (response.mode === "answer") {
        const answerData = response as AskAnswerResponse
        const agentMsg: Message = {
          id: `agent-${Date.now()}`,
          role: "agent",
          content: answerData.answer_text,
          suggestedLinks: answerData.suggested_links,
        }
        setMessages((prev) => [...prev, agentMsg])
      } else {
        const showData = response as AskShowResponse
        const agentMsg: Message = {
          id: `agent-${Date.now()}`,
          role: "agent",
          content: showData.answer_text,
          steps: showData.steps,
          finalUrl: showData.final_url,
          sessionId: showData.session_id,
          narrationScript: showData.narration_script,
          narrationAudioUrl: showData.narration_audio_url,
        }
        setMessages((prev) => [...prev, agentMsg])

        if (embedded) {
          // ── Embedded mode: navigate the parent page + play narration ──
          const navUrl =
            showData.suggested_links?.[0] ||
            showData.final_url

          if (navUrl) {
            // Send narration to PARENT page so audio survives navigation
            if (showData.narration_audio_url) {
              sendToParent({ type: "narrate", audioUrl: showData.narration_audio_url })
            } else if (showData.narration_script) {
              sendToParent({ type: "narrate", text: showData.narration_script })
            }

            // Show navigation message in chat
            setMessages((prev) => [
              ...prev,
              {
                id: `nav-${Date.now()}`,
                role: "agent",
                content: `🧭 Navigating you to the relevant page...`,
                isNavigating: true,
              },
            ])

            setNavigatingUrl(navUrl)

            // Send navigation command to parent after delay for narration to start
            setTimeout(() => {
              sendToParent({ type: "navigate", url: navUrl })
            }, 2500)
          }
        } else {
          // ── Normal mode: open walkthrough modal + play narration ──
          // Auto-play narration in normal mode too
          if (showData.narration_audio_url) {
            try {
              const audio = new Audio(showData.narration_audio_url)
              audio.play()
            } catch { /* ignore audio errors */ }
          } else if (showData.narration_script) {
            try {
              const utterance = new SpeechSynthesisUtterance(showData.narration_script)
              utterance.rate = 1.0
              utterance.pitch = 1.0
              speechSynthesis.speak(utterance)
            } catch { /* ignore speech errors */ }
          }

          // Auto-navigate to the relevant URL in a new tab
          const navUrl = showData.suggested_links?.[0] || showData.final_url
          if (navUrl && navUrl.startsWith("http")) {
            setTimeout(() => {
              window.open(navUrl, "_blank")
            }, 1500)
          }

          setWalkthroughSession({
            sessionId: showData.session_id,
            narrationScript: showData.narration_script,
            narrationAudioUrl: showData.narration_audio_url,
          })
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "agent",
          content:
            "Sorry, I encountered an error. Please make sure the backend is running and try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const suggestedQuestions = companyName
    ? [
        `How do I get started with ${companyName}?`,
        `What are the main features?`,
        `Show me the quickstart`,
      ]
    : [
        "How do I get started?",
        "What are the main features?",
        "Show me the docs",
      ]

  return (
    <>
      <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.02] px-5 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
            <Bot className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Calex</p>
            <p className="text-[11px] text-muted-foreground">AI DevRel Agent</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 animate-fade-up ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    msg.role === "agent"
                      ? "bg-violet-500/10"
                      : "bg-white/10"
                  }`}
                >
                  {msg.role === "agent" ? (
                    <Bot className="h-4 w-4 text-violet-400" />
                  ) : (
                    <User className="h-4 w-4 text-foreground" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                      : "border border-white/5 bg-white/[0.03] text-foreground"
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Suggested Links */}
                  {msg.suggestedLinks && msg.suggestedLinks.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {msg.suggestedLinks.map((link, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (embedded) {
                              sendToParent({ type: "navigate", url: link })
                            } else {
                              window.open(link, "_blank")
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-400 transition-all hover:bg-violet-500/20"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {(() => { try { return new URL(link).pathname || link } catch { return link } })()}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Steps */}
                  {msg.steps && msg.steps.length > 0 && (
                    <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Monitor className="h-3.5 w-3.5 text-violet-400" />
                        <span className="text-[11px] font-semibold text-violet-400">Walkthrough Steps</span>
                      </div>
                      <ol className="flex flex-col gap-1.5">
                        {msg.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Final URL */}
                  {msg.finalUrl && (
                    <button
                      onClick={() => {
                        if (embedded) {
                          sendToParent({ type: "navigate", url: msg.finalUrl! })
                        } else {
                          window.open(msg.finalUrl!, "_blank")
                        }
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <Globe className="h-3 w-3" />
                      {embedded ? "Navigate here →" : msg.finalUrl}
                    </button>
                  )}

                  {/* Watch walkthrough button */}
                  {msg.sessionId && (
                    <button
                      onClick={() =>
                        setWalkthroughSession({
                          sessionId: msg.sessionId!,
                          narrationScript: msg.narrationScript,
                          narrationAudioUrl: msg.narrationAudioUrl,
                        })
                      }
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-400 transition-all hover:bg-violet-500/20"
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      Watch Walkthrough
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10">
                  <Bot className="h-4 w-4 text-violet-400" />
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-violet-400" style={{ animation: "typing-dot 1.4s infinite", animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-violet-400" style={{ animation: "typing-dot 1.4s infinite", animationDelay: "200ms" }} />
                    <div className="h-2 w-2 rounded-full bg-violet-400" style={{ animation: "typing-dot 1.4s infinite", animationDelay: "400ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Suggested questions — only show when no user messages yet */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q)
                    }}
                    className="rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2 text-xs text-muted-foreground transition-all hover:border-violet-500/20 hover:text-foreground hover:bg-white/[0.04]"
                  >
                    <Sparkles className="inline h-3 w-3 mr-1 text-violet-400" />
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend("answer")
                }
              }}
              placeholder={`Ask anything about ${companyName || "this company"}...`}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-violet-500/30 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all"
              disabled={loading}
            />
            <button
              onClick={() => handleSend("answer")}
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              Answer
            </button>
            <button
              onClick={() => handleSend("show")}
              disabled={loading || !input.trim()}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-400 transition-all hover:bg-violet-500/20 disabled:opacity-50"
            >
              <Globe className="h-4 w-4" />
              Show Me
            </button>
          </div>
        </div>
      </div>

      {/* Walkthrough Modal */}
      {walkthroughSession && (
        <WalkthroughModal
          sessionId={walkthroughSession.sessionId}
          narrationScript={walkthroughSession.narrationScript}
          narrationAudioUrl={walkthroughSession.narrationAudioUrl}
          onClose={() => setWalkthroughSession(null)}
        />
      )}
    </>
  )
}
