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
  Loader2,
  ExternalLink,
  CheckCircle2,
  Bot,
  User,
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
}

interface CalexWidgetChatProps {
  companyId: string
  companyName?: string
}

export function CalexWidgetChat({
  companyId,
  companyName,
}: CalexWidgetChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      content: `Hi! I'm Calex, your DevRel assistant${
        companyName ? ` for ${companyName}` : ""
      }. Ask me anything, or try "Show Me" for a live walkthrough.`,
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [walkthroughSession, setWalkthroughSession] = useState<{
    sessionId: string
    narrationScript?: string
  } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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
        }
        setMessages((prev) => [...prev, agentMsg])
        setWalkthroughSession({
          sessionId: showData.session_id,
          narrationScript: showData.narration_script,
        })
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

  return (
    <>
      <div className="flex h-full flex-col rounded-xl border border-border bg-card">
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Calex</p>
            <p className="text-xs text-muted-foreground">DevRel Agent</p>
          </div>
          <div className="ml-auto flex h-2 w-2 rounded-full bg-success" />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "agent"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {msg.role === "agent" ? (
                    <Bot className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Suggested Links */}
                  {msg.suggestedLinks && msg.suggestedLinks.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.suggestedLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary transition-colors hover:bg-primary/20"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {(() => { try { return new URL(link).pathname || link } catch { return link } })()}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Steps */}
                  {msg.steps && msg.steps.length > 0 && (
                    <ol className="mt-3 flex flex-col gap-1.5">
                      {msg.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Final URL */}
                  {msg.finalUrl && (
                    <a
                      href={msg.finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {msg.finalUrl}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="rounded-xl bg-secondary px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
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
              placeholder={`Ask a question about ${companyName || "this company"}...`}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={loading}
            />
            <button
              onClick={() => handleSend("answer")}
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              Answer
            </button>
            <button
              onClick={() => handleSend("show")}
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3.5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
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
          onClose={() => setWalkthroughSession(null)}
        />
      )}
    </>
  )
}
