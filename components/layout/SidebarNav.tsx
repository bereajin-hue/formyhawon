'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import XPBar from '@/components/gamification/XPBar'
import StreakBadge from '@/components/gamification/StreakBadge'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'
import type { Profile } from '@/types'

interface SidebarNavProps {
  profile: Profile
}

export default function SidebarNav({ profile }: SidebarNavProps) {
  const pathname = usePathname()
  const { t, lang, setLang } = useT()
  const isParent = profile.role === 'parent'

  const navItems = isParent
    ? [{ href: '/parent', icon: '👨‍👩‍👧', label: t(T.nav.childDashboard) }]
    : [
        { href: '/dashboard', icon: '🏠', label: t(T.nav.home) },
        { href: '/library', icon: '📚', label: t(T.nav.library) },
        { href: '/writing', icon: '✍️', label: t(T.nav.essay) },
        { href: '/vocab', icon: '🔤', label: t(T.nav.vocab) },
        { href: '/certificate', icon: '🎓', label: t(T.nav.certificate) },
        { href: '/math', icon: '🔢', label: 'Math Quest' },
      ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 shadow-sm">
      {/* 로고 */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-lg">📚</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Scholar Quest</h1>
            <p className="text-xs text-gray-400">30일 챌린지</p>
          </div>
        </div>
      </div>

      {/* 프로필 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-indigo-200 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
              {profile.name[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm leading-tight">{profile.name}</p>
              <p className="text-xs text-indigo-500">
                {isParent ? t(T.nav.parentAccount) : T.common.grade(profile.grade ?? 0, lang)}
              </p>
            </div>
          </div>
          {!isParent && <StreakBadge days={profile.streak_days} />}
        </div>
      </div>

      {/* XP 바 (학생만) */}
      {!isParent && (
        <div className="px-4 py-3 border-b border-gray-100">
          <XPBar current={profile.xp_total} />
        </div>
      )}

      {/* 내비게이션 */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
            </Link>
          )
        })}
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
