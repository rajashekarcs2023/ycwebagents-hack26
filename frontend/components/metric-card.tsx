"use client"

import type { LucideIcon } from "lucide-react"

const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", glow: "shadow-violet-500/5" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "shadow-blue-500/5" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", glow: "shadow-amber-500/5" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "shadow-emerald-500/5" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-400", glow: "shadow-pink-500/5" },
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  color?: string
}

export function MetricCard({ title, value, icon: Icon, trend, color = "violet" }: MetricCardProps) {
  const c = colorMap[color] || colorMap.violet

  return (
    <div className={`group relative rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-violet-500/10 hover:bg-white/[0.04] shadow-lg ${c.glow}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        {trend && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            {trend}
          </span>
        )}
      </div>
      <p className="text-base text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  )
}
