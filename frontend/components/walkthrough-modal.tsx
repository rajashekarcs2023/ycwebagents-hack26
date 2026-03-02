"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getBrowserRun, type BrowserRunResponse } from "@/lib/api"
import {
  X,
  Play,
  Pause,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Monitor,
  Volume2,
  Terminal,
} from "lucide-react"

interface WalkthroughModalProps {
  sessionId: string
  narrationScript?: string
  narrationAudioUrl?: string | null
  onClose: () => void
}

const statusConfig: Record<string, { label: string; dotColor: string; textColor: string; icon: typeof Loader2 }> = {
  running: { label: "Running", dotColor: "bg-amber-500", textColor: "text-amber-400", icon: Loader2 },
  completed: { label: "Completed", dotColor: "bg-emerald-500", textColor: "text-emerald-400", icon: CheckCircle2 },
  failed: { label: "Failed", dotColor: "bg-red-500", textColor: "text-red-400", icon: XCircle },
}

export function WalkthroughModal({
  sessionId,
  narrationScript,
  narrationAudioUrl,
  onClose,
}: WalkthroughModalProps) {
  const [data, setData] = useState<BrowserRunResponse | null>(null)
  const [error, setError] = useState(false)
  const [isNarrating, setIsNarrating] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)

  const fetchRun = useCallback(async () => {
    try {
      const run = await getBrowserRun(sessionId)
      setData(run)
      setError(false)
      return run.status
    } catch {
      setError(true)
      return "failed"
    }
  }, [sessionId])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    const poll = async () => {
      const status = await fetchRun()
      if (status === "running") {
        interval = setInterval(async () => {
          const s = await fetchRun()
          if (s !== "running") clearInterval(interval)
        }, 2000)
      }
    }
    poll()
    return () => clearInterval(interval)
  }, [fetchRun])

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [data?.run_log])

  // Auto-play narration when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      if (narrationAudioUrl) {
        const audio = new Audio(narrationAudioUrl)
        audioRef.current = audio
        audio.onended = () => setIsNarrating(false)
        audio.play().catch(() => {})
        setIsNarrating(true)
      } else if (narrationScript) {
        try {
          const utterance = new SpeechSynthesisUtterance(narrationScript)
          utterance.rate = 1.0
          utterance.pitch = 1.0
          utterance.onend = () => setIsNarrating(false)
          window.speechSynthesis.speak(utterance)
          setIsNarrating(true)
        } catch {}
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [narrationAudioUrl, narrationScript])

  const handleNarrate = () => {
    if (isNarrating) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      window.speechSynthesis.cancel()
      setIsNarrating(false)
      return
    }
    if (narrationAudioUrl) {
      const audio = new Audio(narrationAudioUrl)
      audioRef.current = audio
      audio.onended = () => setIsNarrating(false)
      audio.play()
      setIsNarrating(true)
      return
    }
    const script = narrationScript || data?.purpose
    if (!script) return
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.onend = () => setIsNarrating(false)
    window.speechSynthesis.speak(utterance)
    setIsNarrating(true)
  }

  const statusInfo = data ? statusConfig[data.status] : null
  const StatusIcon = statusInfo?.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="mx-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0e0e16] shadow-2xl shadow-violet-500/5 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Monitor className="h-4.5 w-4.5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Live Walkthrough
              </h2>
              {data && (
                <p className="text-[11px] text-muted-foreground truncate max-w-[300px]">
                  {data.purpose}
                </p>
              )}
            </div>
            {statusInfo && StatusIcon && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium">
                <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotColor} ${data?.status === "running" ? "animate-pulse" : ""}`} />
                <span className={statusInfo.textColor}>{statusInfo.label}</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && !data && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-red-400">Failed to load walkthrough session.</p>
            </div>
          )}

          {data && (
            <>
              {/* Run Log — terminal style */}
              <div className="mb-4 rounded-xl border border-white/5 bg-black/40 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5 bg-white/[0.02]">
                  <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-mono text-muted-foreground">browser-agent.log</span>
                  {data.status === "running" && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </div>
                <div
                  ref={logContainerRef}
                  className="max-h-56 overflow-y-auto p-4"
                >
                  {data.run_log.length === 0 ? (
                    <p className="font-mono text-xs text-muted-foreground/50">Waiting for log entries...</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {data.run_log.map((entry, i) => (
                        <p
                          key={i}
                          className="font-mono text-xs text-emerald-400/80 animate-in fade-in duration-200 leading-relaxed"
                        >
                          <span className="text-muted-foreground/40 mr-2">$</span>
                          {entry}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Frame */}
              {data.preview_frames && data.preview_frames.length > 0 && (
                <div className="mb-4 overflow-hidden rounded-xl border border-white/5">
                  <img
                    src={data.preview_frames[data.preview_frames.length - 1]}
                    alt="Walkthrough preview"
                    className="w-full"
                    crossOrigin="anonymous"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleNarrate}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    isNarrating
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                      : "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                  }`}
                >
                  {isNarrating ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Stop Narration
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Play Narration
                    </>
                  )}
                </button>

                {data.status === "completed" && data.final_url && (
                  <a
                    href={data.final_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-white/10"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Final Page
                  </a>
                )}

                {narrationAudioUrl && (
                  <span className="ml-auto text-[10px] text-emerald-400 font-medium">
                    MiniMax TTS
                  </span>
                )}
              </div>
            </>
          )}

          {!data && !error && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
              <p className="text-sm text-muted-foreground">Loading walkthrough...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
