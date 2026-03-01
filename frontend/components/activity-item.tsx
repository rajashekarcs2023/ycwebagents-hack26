"use client"

import {
  MessageSquare,
  Globe,
  Hash,
  AlertTriangle,
  Rocket,
  Brain,
  Mail,
  CheckCircle2,
} from "lucide-react"
import type { ActivityFeedItem } from "@/lib/api"

const typeIconMap: Record<string, typeof MessageSquare> = {
  widget_answered: MessageSquare,
  walkthrough_executed: Globe,
  community_answered: Hash,
  escalated: AlertTriangle,
  onboarding_started: Rocket,
  memory_built: Brain,
  identity_created: Mail,
  setup_complete: CheckCircle2,
}

const statusStyles: Record<string, string> = {
  success: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  error: "bg-destructive/15 text-destructive",
}

function getRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface ActivityItemProps {
  item: ActivityFeedItem
  onWatch?: (sessionId: string) => void
}

export function ActivityItem({ item, onWatch }: ActivityItemProps) {
  const Icon = typeIconMap[item.type] || MessageSquare

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-foreground">{item.title}</p>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              statusStyles[item.status] || statusStyles.pending
            }`}
          >
            {item.status}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
          {item.detail}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {getRelativeTime(item.ts)}
        </span>
        {item.session_id && onWatch && (
          <button
            onClick={() => onWatch(item.session_id!)}
            className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            Watch
          </button>
        )}
      </div>
    </div>
  )
}
