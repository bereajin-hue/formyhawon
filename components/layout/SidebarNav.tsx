'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import StreakBadge from '@/components/gamification/StreakBadge'
import UnifiedXPBar from '@/components/gamification/UnifiedXPBar'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'
import type { Profile } from '@/types'

interface SidebarNavProps {
  profile: Profile
  scholarXp: number
  mathXp: number
}

type QuestMode = 'scholar' | 'math'

const SCHOLAR_NAV = [
  { href: '/dashboard',   icon: '🏠', labelKey: 'home' as const },
  { href: '/library',     icon: '📚', labelKey: 'library' as const },
  { href: '/writing',     icon: '✍️',  labelKey: 'essay' as const },
  { href: '/vocab',       icon: '🔤', labelKey: 'vocab' as const },
  { href: '/certificate', icon: '🎓', labelKey: 'certificate' as const },
]

const MATH_NAV = [
  { href: '/math',          icon: '🏠', label: { ko: '수학 홈',   en: 'Math Home' } },
  { href: '/math/review',   icon: '🔁', label: { ko: '복습 큐',   en: 'Review Queue' } },
  { href: '/math/progress', icon: '📊', label: { ko: '진행률',    en: 'Progress' } },
]

// Math 모드 색상 (에메랄드 그린)
const MATH_ACTIVE  = 'bg-emerald-600 text-white shadow-sm'
const MATH_HOVER   = 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
const MATH_LOGO_BG = 'from-emerald-500 to-teal-600'
const MATH_XP_TEXT = 'text-emerald-600'

// Scholar 모드 색상 (인디고)
const SCH_ACTIVE   = 'bg-indigo-600 text-white shadow-sm'
const SCH_HOVER    = 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
const SCH_LOGO_BG  = 'from-indigo-500 to-purple-600'

export default function SidebarNav({ profile, scholarXp, mathXp }: SidebarNavProps) {
  const pathname = usePathname()
  const { t, lang, setLang } = useT()
  const isParent = profile.role === 'parent'

  // 현재 경로 기반 자동 감지, 수동 전환도 가능
  const autoMode: QuestMode = pathname.startsWith('/math') ? 'math' : 'scholar'
  const [mode, setMode] = useState<QuestMode>(autoMode)

  useEffect(() => {
    setMode(autoMode)
  }, [autoMode])

  const isMath = mode === 'math'

  const activeClass  = isMath ? MATH_ACTIVE  : SCH_ACTIVE
  const hoverClass   = isMath ? MATH_HOVER   : SCH_HOVER
  const logoBg       = isMath ? MATH_LOGO_BG : SCH_LOGO_BG

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 shadow-sm">

      {/* 로고 */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 bg-gradient-to-br ${logoBg} rounded-xl flex items-center justify-center shadow-sm transition-all duration-300`}>
            <span className="text-lg">{isMath ? '🔢' : '📚'}</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">
              {isMath ? 'Math Quest' : 'Scholar Quest'}
            </h1>
            <p className="text-xs text-gray-400">30{lang === 'ko' ? '일 챌린지' : '-Day Challenge'}</p>
          </div>
        </div>
      </div>

      {/* Quest 스위처 (학생만) */}
      {!isParent && (
        <div className="px-3 pt-3 pb-2">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('scholar')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1
                ${!isMath ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📚 {lang === 'ko' ? '영어' : 'Scholar'}
            </button>
            <button
              onClick={() => setMode('math')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1
                ${isMath ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🔢 {lang === 'ko' ? '수학' : 'Math'}
            </button>
          </div>
        </div>
      )}

      {/* 프로필 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className={`rounded-xl px-4 py-3 ${isMath ? 'bg-gradient-to-r from-emerald-50 to-teal-50' : 'bg-gradient-to-r from-indigo-50 to-purple-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${isMath ? 'bg-emerald-200 text-emerald-700' : 'bg-indigo-200 text-indigo-700'}`}>
              {profile.name[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm leading-tight">{profile.name}</p>
              <p className={`text-xs ${isMath ? MATH_XP_TEXT : 'text-indigo-500'}`}>
                {isParent ? t(T.nav.parentAccount) : T.common.grade(profile.grade ?? 0, lang)}
              </p>
            </div>
          </div>
          {!isParent && <StreakBadge days={profile.streak_days} />}
        </div>
      </div>

      {/* 통합 XP 바 (학생만) */}
      {!isParent && (
        <div className="px-4 py-3 border-b border-gray-100">
          <UnifiedXPBar scholarXp={scholarXp} mathXp={mathXp} />
        </div>
      )}

      {/* 내비게이션 */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {isParent ? (
          <Link
            href="/parent"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${pathname === '/parent' ? SCH_ACTIVE : SCH_HOVER}`}
          >
            <span className="text-base">👨‍👩‍👧</span>
            {t(T.nav.childDashboard)}
          </Link>
        ) : isMath ? (
          // Math Quest 네비
          <>
            {MATH_NAV.map((item) => {
              const isActive = item.href === '/math'
                ? pathname === '/math'
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive ? activeClass : hoverClass}`}
                >
                  <span className="text-base">{item.icon}</span>
                  {lang === 'ko' ? item.label.ko : item.label.en}
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
                </Link>
              )
            })}

            {/* 빠른 세션 접근 */}
            <div className="pt-2 mt-2 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide px-3 mb-1">
                {lang === 'ko' ? '빠른 시작' : 'Quick Start'}
              </p>
              <Link
                href="/math"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${hoverClass}`}
              >
                <span className="text-base">▶️</span>
                {lang === 'ko' ? '오늘 학습' : "Today's Session"}
              </Link>
            </div>
          </>
        ) : (
          // Scholar Quest 네비
          SCHOLAR_NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive ? activeClass : hoverClass}`}
              >
                <span className="text-base">{item.icon}</span>
                {t(T.nav[item.labelKey])}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </Link>
            )
          })
        )}
      </nav>

      {/* 언어 토글 */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setLang('ko')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              lang === 'ko' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🇰🇷 한국어
          </button>
          <button
            onClick={() => setLang('en')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              lang === 'en' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🇺🇸 English
          </button>
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="px-3 py-3 border-t border-gray-100">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-sm"
          >
            <span>🚪</span>
            {t(T.common.logout)}
          </button>
        </form>
      </div>
    </aside>
  )
}
