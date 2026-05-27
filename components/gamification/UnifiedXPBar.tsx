'use client'

import { useT } from '@/lib/i18n/LanguageContext'

interface UnifiedXPBarProps {
  scholarXp: number
  mathXp: number
}

const LEVEL_XP = 500

export function getTotalLevel(total: number) {
  return Math.floor(total / LEVEL_XP) + 1
}

export default function UnifiedXPBar({ scholarXp, mathXp }: UnifiedXPBarProps) {
  const { lang } = useT()
  const total = scholarXp + mathXp
  const level = getTotalLevel(total)
  const inLevelXp = total % LEVEL_XP
  const pct = Math.round((inLevelXp / LEVEL_XP) * 100)

  // Scholar vs Math 비율 (바 안에서)
  const scholarPct = total > 0 ? Math.round((scholarXp / total) * pct) : pct / 2
  const mathPct = pct - scholarPct

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-bold text-gray-700">Lv.{level}</span>
        <span className="text-gray-400">{inLevelXp} / {LEVEL_XP} XP</span>
      </div>

      {/* 통합 XP 바 (인디고=Scholar, 초록=Math) */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
        {scholarPct > 0 && (
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
            style={{ width: `${scholarPct}%` }}
          />
        )}
        {mathPct > 0 && (
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${mathPct}%` }}
          />
        )}
      </div>

      {/* 범례 */}
      <div className="flex gap-3 mt-1.5">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-[10px] text-gray-400">
            {lang === 'ko' ? `영어 ${scholarXp.toLocaleString()}` : `Scholar ${scholarXp.toLocaleString()}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-gray-400">
            {lang === 'ko' ? `수학 ${mathXp.toLocaleString()}` : `Math ${mathXp.toLocaleString()}`}
          </span>
        </div>
      </div>
    </div>
  )
}
