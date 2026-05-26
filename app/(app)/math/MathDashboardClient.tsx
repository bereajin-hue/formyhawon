'use client'

import Link from 'next/link'
import { CheckCircle, BookOpen, Clock, RefreshCw, ChevronRight, Flame, Calculator } from 'lucide-react'
import type { Profile, MathSession } from '@/types'
import type { Topic } from '@/lib/math/topics'

interface Props {
  profile: Profile
  topics: Topic[]
  sessionMap: Record<number, MathSession>
  currentDay: number
  completedDays: number[]
  reviewCount: number
}

const AREA_COLORS: Record<string, string> = {
  number: 'bg-blue-50 border-blue-200',
  algebra: 'bg-purple-50 border-purple-200',
  geometry: 'bg-green-50 border-green-200',
  statistics: 'bg-orange-50 border-orange-200',
  sequences: 'bg-pink-50 border-pink-200',
  transformation: 'bg-teal-50 border-teal-200',
}

const AREA_DOT: Record<string, string> = {
  number: 'bg-blue-400',
  algebra: 'bg-purple-400',
  geometry: 'bg-green-400',
  statistics: 'bg-orange-400',
  sequences: 'bg-pink-400',
  transformation: 'bg-teal-400',
}

export default function MathDashboardClient({ profile, topics, sessionMap, currentDay, completedDays, reviewCount }: Props) {
  const todayTopic = topics.find(t => t.day === currentDay)
  const todaySession = sessionMap[currentDay] ?? null

  function getSessionHref(): string {
    if (!todaySession || todaySession.status === 'not_started') return `/math/session/${currentDay}`
    if (todaySession.status === 'in_progress') return `/math/session/${currentDay}/problems`
    return `/math/session/${currentDay}`
  }

  function getSessionLabel(): string {
    if (!todaySession || todaySession.status === 'not_started') return '학습 시작하기'
    if (todaySession.status === 'in_progress') return '이어하기'
    return '완료 ✓'
  }

  const totalXp = Object.values(sessionMap).reduce((sum, s) => sum + (s.xp_earned ?? 0), 0)

  return (
    <div className="max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Math Quest</h1>
          </div>
          <p className="text-gray-500">안녕하세요, {profile.name}님! Day {currentDay} / 30</p>
        </div>
        <div className="flex gap-2">
          {profile.streak_days > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">{profile.streak_days}일 연속</span>
            </div>
          )}
          {reviewCount > 0 && (
            <Link href="/math/review" className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition">
              <RefreshCw className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-indigo-600">복습 {reviewCount}개</span>
            </Link>
          )}
        </div>
      </div>

      {/* 오늘의 미션 카드 */}
      {todayTopic && (
        <div className={`rounded-2xl border p-6 mb-6 ${AREA_COLORS[todayTopic.area] ?? 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">오늘의 미션</p>
              <p className="text-sm text-gray-500">Day {currentDay}</p>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{todayTopic.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${AREA_DOT[todayTopic.area] ?? 'bg-gray-400'}`} />
                <span className="text-sm text-gray-500">{todayTopic.area}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">획득 가능 XP</p>
              <p className="text-2xl font-bold text-indigo-600">+50~</p>
            </div>
          </div>
          <Link
            href={getSessionHref()}
            className={`mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition
              ${todaySession?.status === 'completed'
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
          >
            {todaySession?.status === 'completed' ? (
              <><CheckCircle className="w-5 h-5" />{getSessionLabel()}</>
            ) : (
              <><BookOpen className="w-5 h-5" />{getSessionLabel()}<ChevronRight className="w-4 h-4" /></>
            )}
          </Link>
        </div>
      )}

      {/* 내비게이션 링크 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link href="/math/review" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition text-center">
          <RefreshCw className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-700">복습</p>
          {reviewCount > 0 && <p className="text-xs text-indigo-600 font-semibold">{reviewCount}개 대기</p>}
        </Link>
        <Link href="/math/progress" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition text-center">
          <Clock className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-700">진행률</p>
          <p className="text-xs text-gray-400">{completedDays.length}/30일</p>
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <span className="text-xs">⭐</span>
          </div>
          <p className="text-sm font-medium text-gray-700">XP</p>
          <p className="text-xs text-yellow-600 font-semibold">{totalXp.toLocaleString()}</p>
        </div>
      </div>

      {/* 30일 달력 그리드 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">30일 학습 달력</h2>
        <div className="grid grid-cols-6 gap-2">
          {topics.map((topic) => {
            const isCompleted = completedDays.includes(topic.day)
            const isToday = topic.day === currentDay
            const isFuture = topic.day > currentDay
            return (
              <Link
                key={topic.day}
                href={isFuture ? '#' : `/math/session/${topic.day}`}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold border transition
                  ${isCompleted ? 'bg-green-50 border-green-200 text-green-700' :
                    isToday ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' :
                    isFuture ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-default' :
                    'bg-orange-50 border-orange-100 text-orange-600 hover:border-orange-300'
                  }`}
              >
                <span className="text-base">{isCompleted ? '✓' : topic.day}</span>
                {isToday && <span className="text-[10px] opacity-75">오늘</span>}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded" />완료</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-600 rounded" />오늘</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-50 border border-orange-100 rounded" />미완료</div>
        </div>
      </div>
    </div>
  )
}
