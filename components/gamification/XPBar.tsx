'use client'

import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'

interface XPBarProps {
  current: number
  label?: boolean
}

const MILESTONES = [
  { day: 10, xp: 500 },
  { day: 20, xp: 900 },
  { day: 30, xp: 1500 },
]

export function getNextMilestone(xp: number) {
  return MILESTONES.find((m) => xp < m.xp) ?? MILESTONES[MILESTONES.length - 1]
}

export default function XPBar({ current, label = true }: XPBarProps) {
  const { lang } = useT()
  const next = getNextMilestone(current)
  const base = MILESTONES[MILESTONES.indexOf(next) - 1]?.xp ?? 0
  const pct = Math.min(100, Math.round(((current - base) / (next.xp - base)) * 100))

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{T.xpbar.milestone(next.day, lang)}</span>
          <span className="font-medium text-indigo-600">{current} / {next.xp} XP</span>
        </div>
      )}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {label && (
        <p className="text-xs text-gray-400 mt-1">{T.xpbar.moreXp(Math.max(0, next.xp - current), lang)}</p>
      )}
    </div>
  )
}
