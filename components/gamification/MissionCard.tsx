'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'
import type { Mission } from '@/types'

interface MissionCardProps {
  mission: Mission
  onComplete: (id: string) => void
}

const ICONS: Record<string, string> = {
  vocab: '🔤',
  reading: '📖',
  essay: '✍️',
}

const COLORS: Record<string, string> = {
  vocab: 'border-blue-200 bg-blue-50',
  reading: 'border-green-200 bg-green-50',
  essay: 'border-purple-200 bg-purple-50',
}

const DONE_COLORS: Record<string, string> = {
  vocab: 'border-blue-300 bg-blue-100',
  reading: 'border-green-300 bg-green-100',
  essay: 'border-purple-300 bg-purple-100',
}

// vocab과 essay는 실제 활동 완료 시 자동 처리됨
const AUTO_TYPES = new Set(['vocab', 'essay'])

export default function MissionCard({ mission, onComplete }: MissionCardProps) {
  const [loading, setLoading] = useState(false)
  const { t } = useT()

  const isAuto = AUTO_TYPES.has(mission.type)
  const isClickable = !isAuto && !mission.completed

  async function handleClick() {
    if (!isClickable || loading) return
    setLoading(true)
    await onComplete(mission.id)
    setLoading(false)
  }

  const color = mission.completed ? DONE_COLORS[mission.type] : COLORS[mission.type]

  const titlePair = T.mission.titles[mission.type as keyof typeof T.mission.titles]
  const autoHintPair = T.mission.autoHint[mission.type as keyof typeof T.mission.autoHint]

  return (
    <div
      className={`rounded-xl border-2 p-5 transition-all ${color} ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{ICONS[mission.type]}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/70 text-gray-600">
            +{mission.xp} XP
          </span>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${mission.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
            {mission.completed && <span className="text-white text-xs">✓</span>}
          </div>
        </div>
      </div>

      <h3 className={`font-semibold text-sm ${mission.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {titlePair ? t(titlePair) : mission.title}
      </h3>

      {loading && (
        <p className="text-xs text-gray-400 mt-1">{t(T.common.processing)}</p>
      )}
      {!loading && !mission.completed && (
        <p className="text-xs mt-1.5">
          {isAuto ? (
            <span className="text-indigo-400 flex items-center gap-1">
              <span>⚡</span>
              <span>{autoHintPair ? t(autoHintPair) : ''}</span>
            </span>
          ) : (
            <span className="text-gray-400">{t(T.mission.clickComplete)}</span>
          )}
        </p>
      )}
    </div>
  )
}
