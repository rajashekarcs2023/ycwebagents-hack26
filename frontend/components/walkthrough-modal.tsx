"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getBrowserRun, type BrowserRunResponse } from "@/lib/api"
import {
  X,
  Play,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"

interface WalkthroughModalProps {
  sessionId: string
  narrationScript?: string
  onClose: () => void
}

const statusConfig = {
  running: {
    label: "Running",
    className: "bg-warning/15 text-warning",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    className: "bg-success/15 text-success",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/15 text-destructive",
    icon: XCircle,
  },
}

export function WalkthroughModal({
  sessionId,
  narrationScript,
  onClose,
}: WalkthroughModalProps) {
  const [data, setData] = useState<BrowserRunResponse | null>(null)
  const [error, setError] = useState(false)
  const [isNarrating, setIsNarrating] = useState(false)
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

  const handleNarrate = () => {
    const script = narrationScript || data?.purpose
    if (!script) return

    if (isNarrating) {
      window.speechSynthesis.cancel()
      setIsNarrating(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(script)
    utterance.onend = () => setIsNarrating(false)
    window.speechSynthesis.speak(utterance)
    setIsNarrating(true)
  }

  const statusInfo = data ? statusConfig[data.status] : null
  const StatusIcon = statusInfo?.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Live Walkthrough
            </h2>
            {statusInfo && StatusIcon && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}
              >
                <StatusIcon
                  className={`h-3 w-3 ${
                    data?.status === "running" ? "animate-spin" : ""
                  }`}
                />
                {statusInfo.label}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && !data && (
            <p className="text-sm text-destructive">
              Failed to load walkthrough session.
            </p>
          )}

          {data && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {data.purpose}
              </p>

              {/* Run Log */}
              <div
                ref={logContainerRef}
                className="mb-4 max-h-64 overflow-y-auto rounded-lg border border-border bg-background p-4"
              >
                {data.run_log.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Waiting for log entries...
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {data.run_log.map((entry, i) => (
                      <p
                        key={i}
                        className="font-mono text-xs text-foreground animate-in fade-in duration-200"
                      >
                        {entry}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview Frame */}
              {data.preview_frames && data.preview_frames.length > 0 && (
                <div className="mb-4 overflow-hidden rounded-lg border border-border">
                  <img
                    src={data.preview_frames[data.preview_frames.length - 1]}
                    alt="Walkthrough preview"
                    className="w-full"
                    crossOrigin="anonymous"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNarrate}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Play className="h-4 w-4" />
                  {isNarrating ? "Stop Narration" : "Play Narration"}
                </button>

                {data.status === "completed" && data.final_url && (
                  <a
                    href={data.final_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Final Page
                  </a>
                )}
              </div>
            </>
          )}

          {!data && !error && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
