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
  Eye,
  Search,
  Link2,
} from "lucide-react"
import type { ActivityFeedItem } from "@/lib/api"

const typeConfig: Record<string, { icon: typeof MessageSquare; color: string }> = {
  widget_answered: { icon: MessageSquare, color: "bg-violet-500/10 text-violet-400" },
  walkthrough_executed: { icon: Globe, color: "bg-blue-500/10 text-blue-400" },
  community_answered: { icon: Hash, color: "bg-emerald-500/10 text-emerald-400" },
  community_question: { icon: Hash, color: "bg-emerald-500/10 text-emerald-400" },
  escalated: { icon: AlertTriangle, color: "bg-amber-500/10 text-amber-400" },
  onboarding_started: { icon: Rocket, color: "bg-pink-500/10 text-pink-400" },
  memory_built: { icon: Brain, color: "bg-purple-500/10 text-purple-400" },
  identity_created: { icon: Mail, color: "bg-indigo-500/10 text-indigo-400" },
  setup_complete: { icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-400" },
  crawling: { icon: Search, color: "bg-cyan-500/10 text-cyan-400" },
  composio_auth: { icon: Link2, color: "bg-orange-500/10 text-orange-400" },
}

const statusStyles: Record<string, { dot: string; text: string }> = {
  success: { dot: "bg-emerald-500", text: "text-emerald-400" },
  pending: { dot: "bg-amber-500", text: "text-amber-400" },
  error: { dot: "bg-red-500", text: "text-red-400" },
}

function getRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 5) return "just now"
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
  const config = typeConfig[item.type] || { icon: MessageSquare, color: "bg-violet-500/10 text-violet-400" }
  const Icon = config.icon
  const status = statusStyles[item.status] || statusStyles.pending

  return (
    <div className="group flex items-start gap-3.5 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-200 hover:border-violet-500/10 hover:bg-white/[0.04] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-foreground">{item.title}</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium">
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            <span className={status.text}>{item.status}</span>
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 leading-relaxed">
          {item.detail}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-[11px] text-muted-foreground/60 font-mono">
          {getRelativeTime(item.ts)}
        </span>
        {item.session_id && onWatch && (
          <button
            onClick={() => onWatch(item.session_id!)}
            className="inline-flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-400 transition-all hover:bg-violet-500/20"
          >
            <Eye className="h-3 w-3" />
            Watch
          </button>
        )}
      </div>
    </div>
  )
}
