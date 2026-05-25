'use client'

interface Calendar30Props {
  completedDays: number[]
  startDate: string
  currentDay: number
}

export default function Calendar30({ completedDays, startDate, currentDay }: Calendar30Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">30일 챌린지 캘린더</h3>
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: 30 }, (_, i) => {
          const day = i + 1
          const isCompleted = completedDays.includes(day)
          const isCurrent = day === currentDay
          const isFuture = day > currentDay

          return (
            <div
              key={day}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all
                ${isCompleted ? 'bg-green-400 text-white' : ''}
                ${isCurrent && !isCompleted ? 'bg-indigo-500 text-white ring-2 ring-indigo-300 ring-offset-1' : ''}
                ${isFuture ? 'bg-gray-100 text-gray-300' : ''}
                ${!isCompleted && !isCurrent && !isFuture ? 'bg-red-100 text-red-400' : ''}
              `}
              title={`Day ${day}`}
            >
              {day}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400 inline-block" /> 완료</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> 오늘</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> 미완료</span>
      </div>
    </div>
  )
}
