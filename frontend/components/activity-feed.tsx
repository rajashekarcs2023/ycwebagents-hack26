"use client"

import { useEffect, useState, useCallback } from "react"
import { getActivity, type ActivityFeedItem } from "@/lib/api"
import { ActivityItem } from "@/components/activity-item"
import { Inbox } from "lucide-react"

interface ActivityFeedProps {
  companyId: string
  onWatch?: (sessionId: string) => void
}

export function ActivityFeed({ companyId, onWatch }: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityFeedItem[]>([])
  const [error, setError] = useState(false)

  const fetchActivity = useCallback(async () => {
    try {
      const data = await getActivity(companyId)
      setItems(data)
      setError(false)
    } catch {
      setError(true)
    }
  }, [companyId])

  useEffect(() => {
    fetchActivity()
    const interval = setInterval(fetchActivity, 3000)
    return () => clearInterval(interval)
  }, [fetchActivity])

  if (error && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-16">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
          <Inbox className="h-6 w-6 text-red-400" />
        </div>
        <p className="text-sm font-semibold text-foreground">Unable to load activity</p>
        <p className="text-xs mt-1 text-muted-foreground">Make sure the backend is running on localhost:3001</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-16">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
          <Inbox className="h-6 w-6 text-violet-400" />
        </div>
        <p className="text-sm font-semibold text-foreground">No activity yet</p>
        <p className="text-xs mt-1 text-muted-foreground">Events will appear here in real-time</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <ActivityItem key={`${item.ts}-${i}`} item={item} onWatch={onWatch} />
      ))}
    </div>
  )
}

export function useActivityMetrics(companyId: string) {
  const [items, setItems] = useState<ActivityFeedItem[]>([])

  const fetchActivity = useCallback(async () => {
    try {
      const data = await getActivity(companyId)
      setItems(data)
    } catch {
      // silently fail
    }
  }, [companyId])

  useEffect(() => {
    fetchActivity()
    const interval = setInterval(fetchActivity, 3000)
    return () => clearInterval(interval)
  }, [fetchActivity])

  const today = new Date().toDateString()
  const todayItems = items.filter(
    (item) => new Date(item.ts).toDateString() === today
  )

  return {
    items,
    questionsAnswered: todayItems.filter(
      (i) => i.type === "widget_answered" || i.type === "community_answered"
    ).length,
    walkthroughsRun: todayItems.filter(
      (i) => i.type === "walkthrough_executed"
    ).length,
    escalations: todayItems.filter((i) => i.type === "escalated").length,
    avgResponseTime: items.length > 0 ? "1.2s" : "—",
  }
}
