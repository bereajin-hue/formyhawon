'use client'

import Link from 'next/link'
import { CheckCircle, BookOpen, Clock, RefreshCw, ChevronRight, Flame, Calculator } from 'lucide-react'
import type { Profile, MathSession } from '@/types'
import type { Topic } from '@/lib/math/topics'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'

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
  const { t, lang } = useT()

  const todayTopic = topics.find(t => t.day === currentDay)
  const todaySession = sessionMap[currentDay] ?? null

  function getSessionHref(): string {
    if (!todaySession || todaySession.status === 'not_started') return `/math/session/${currentDay}`
    if (todaySession.status === 'in_progress') return `/math/session/${currentDay}/problems`
    return `/math/session/${currentDay}`
  }

  function getSessionLabel(): string {
    if (!todaySession || todaySession.status === 'not_started') return t(T.math.dashboard.startStudy)
    if (todaySession.status === 'in_progress') return t(T.math.dashboard.continueStudy)
    return t(T.math.dashboard.completed)
  }

  const totalXp = Object.values(sessionMap).reduce((sum, s) => sum + (s.xp_earned ?? 0), 0)

  const areaLabel = (area: string) => {
    const key = area as keyof typeof T.math.area
    return T.math.area[key] ? t(T.math.area[key]) : area
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t(T.math.mathQuest)}</h1>
          </div>
          <p className="text-gray-500">{T.math.dashboard.greeting(profile.name, lang)} {T.math.dayOf(currentDay, lang)}</p>
        </div>
        <div className="flex gap-2">
          {profile.streak_days > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">{T.streak.daysStreak(profile.streak_days, lang)}</span>
            </div>
          )}
          {reviewCount > 0 && (
            <Link href="/math/review" className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition">
              <RefreshCw className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-indigo-600">{T.math.dashboard.reviewCount(reviewCount, lang)}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 오늘의 미션 카드 */}
      {todayTopic && (
        <div className={`rounded-2xl border p-6 mb-6 ${AREA_COLORS[todayTopic.area] ?? 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{t(T.math.dashboard.todayMission)}</p>
              <p className="text-sm text-gray-500">{T.math.dayOf(currentDay, lang)}</p>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{todayTopic.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${AREA_DOT[todayTopic.area] ?? 'bg-gray-400'}`} />
                <span className="text-sm text-gray-500">{areaLabel(todayTopic.area)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{t(T.math.dashboard.possibleXp)}</p>
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
          <p className="text-sm font-medium text-gray-700">{t(T.math.dashboard.review)}</p>
          {reviewCount > 0 && <p className="text-xs text-indigo-600 font-semibold">{T.math.dashboard.reviewCount(reviewCount, lang)}</p>}
        </Link>
        <Link href="/math/progress" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition text-center">
          <Clock className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-700">{t(T.math.dashboard.progress)}</p>
          <p className="text-xs text-gray-400">{completedDays.length}/30{lang === 'ko' ? '일' : 'd'}</p>
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <span className="text-xs">⭐</span>
          </div>
          <p className="text-sm font-medium text-gray-700">{t(T.math.dashboard.xpLabel)}</p>
          <p className="text-xs text-yellow-600 font-semibold">{totalXp.toLocaleString()}</p>
        </div>
      </div>

      {/* 30일 달력 그리드 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">{t(T.math.dashboard.calendar)}</h2>
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
                {isToday && <span className="text-[10px] opacity-75">{t(T.math.dashboard.calendarToday)}</span>}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded" />{t(T.math.dashboard.calendarDone)}</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-600 rounded" />{t(T.math.dashboard.calendarToday)}</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-50 border border-orange-100 rounded" />{t(T.math.dashboard.calendarIncomplete)}</div>
        </div>
      </div>
    </div>
  )
}
