'use client'

interface StreakBadgeProps {
  days: number
}

export default function StreakBadge({ days }: StreakBadgeProps) {
  if (days === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
        <span className="text-sm">🌱</span>
        <span className="text-xs font-medium text-gray-500">아직 시작 전</span>
      </div>
    )
  }

  const color =
    days >= 20 ? 'bg-orange-100 text-orange-600' :
    days >= 10 ? 'bg-yellow-100 text-yellow-600' :
    'bg-red-100 text-red-500'

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${color}`}>
      <span className="text-sm">🔥</span>
      <span className="text-xs font-bold">{days}일 연속 달성!</span>
    </div>
  )
}
