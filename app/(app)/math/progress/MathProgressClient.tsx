'use client'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import type { Profile, MathSession, MathDailyReport } from '@/types'
import type { Topic } from '@/lib/math/topics'

interface Props {
  profile: Profile
  sessions: MathSession[]
  reports: MathDailyReport[]
  topics: Topic[]
  completedCount: number
  totalXp: number
  level: number
  areaStats: Record<string, { correct: number; total: number }>
  reviewByDate: Record<string, number>
}

const AREA_LABELS: Record<string, string> = {
  number: '수',
  algebra: '대수',
  geometry: '기하',
  statistics: '통계',
  sequences: '수열',
  transformation: '변환',
}

const AREA_COLORS: Record<string, string> = {
  number: '#6366f1',
  algebra: '#8b5cf6',
  geometry: '#10b981',
  statistics: '#f59e0b',
  sequences: '#ec4899',
  transformation: '#14b8a6',
}

export default function MathProgressClient({
  reports,
  topics,
  completedCount,
  totalXp,
  level,
  areaStats,
  reviewByDate,
}: Props) {
  const lineData = topics.map((t) => {
    const report = reports.find((r) => r.day_number === t.day)
    return {
      day: `Day ${t.day}`,
      rate: report ? Math.round((report.correct_count / Math.max(report.total_problems, 1)) * 100) : null,
    }
  }).filter(d => d.rate !== null)

  const barData = Object.entries(areaStats)
    .filter(([, v]) => v.total > 0)
    .map(([area, v]) => ({
      area: AREA_LABELS[area] ?? area,
      rate: Math.round((v.correct / v.total) * 100),
      color: AREA_COLORS[area] ?? '#6366f1',
    }))

  const weakTopics = topics
    .map((t) => {
      const report = reports.find((r) => r.day_number === t.day)
      if (!report || report.total_problems === 0) return null
      return {
        title: t.title,
        rate: Math.round((report.correct_count / report.total_problems) * 100),
        total: report.total_problems,
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a!.rate - b!.rate))
    .slice(0, 3) as { title: string; rate: number; total: number }[]

  const upcomingReviews = Object.entries(reviewByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 5)

  const xpProgress = totalXp % 500
  const xpForLevel = 500

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">수학 진행률</h1>
        <p className="text-gray-500 mt-1">30일 IGCSE 수학 챌린지</p>
      </div>

      {/* 요약 카드 3개 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-indigo-600">{completedCount}<span className="text-lg text-gray-400">/30</span></p>
          <p className="text-sm text-gray-500 mt-1">완료 일수</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-yellow-500">{totalXp.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">누적 XP</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-purple-600">Lv.{level}</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full transition-all" style={{ width: `${(xpProgress / xpForLevel) * 100}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{xpProgress}/{xpForLevel} XP</p>
        </div>
      </div>

      {/* 일별 정답률 차트 */}
      {lineData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">일별 정답률</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, '정답률']} />
              <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 영역별 정답률 차트 */}
      {barData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">영역별 정답률</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="area" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, '정답률']} />
              <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* 약점 토픽 */}
        {weakTopics.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">약점 Top 3</h2>
            <div className="space-y-3">
              {weakTopics.map((t, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-700 truncate pr-2">{t.title}</p>
                    <span className="text-xs font-semibold text-red-500 flex-shrink-0">{t.rate}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${t.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 복습 큐 */}
        {upcomingReviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">예정 복습</h2>
            <div className="space-y-2">
              {upcomingReviews.map(([date, count]) => (
                <div key={date} className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{date}</p>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {count}문제
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
