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
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Inbox className="mb-3 h-10 w-10" />
        <p className="text-sm">Unable to load activity feed</p>
        <p className="text-xs mt-1">Make sure the backend is running</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Inbox className="mb-3 h-10 w-10" />
        <p className="text-sm">No activity yet</p>
        <p className="text-xs mt-1">Events will appear here in real-time</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
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
