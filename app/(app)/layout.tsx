import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/setup')

  const isParent = profile.role === 'parent'

  const navItems = isParent
    ? [{ href: '/parent', icon: '👨‍👩‍👧', label: '대시보드' }]
    : [
        { href: '/dashboard', icon: '🏠', label: '홈' },
        { href: '/library', icon: '📚', label: '책 라이브러리' },
        { href: '/writing', icon: '✍️', label: '에세이' },
        { href: '/vocab', icon: '🔤', label: '어휘 학습' },
      ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        {/* 로고 */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">📚</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">Scholar Quest</h1>
              <p className="text-xs text-gray-400">30일 챌린지</p>
            </div>
          </div>
        </div>

        {/* 프로필 */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="bg-indigo-50 rounded-xl px-4 py-3">
            <p className="font-medium text-gray-800 text-sm">{profile.name}</p>
            <p className="text-xs text-indigo-500 mt-0.5">
              {isParent ? '부모 계정' : `${profile.grade}학년 · ${profile.xp_total} XP`}
            </p>
          </div>
        </div>

        {/* XP 바 (학생만) */}
        {!isParent && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>XP 진행도</span>
              <span>{profile.xp_total} / {nextMilestoneXP(profile.xp_total)} XP</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (profile.xp_total / nextMilestoneXP(profile.xp_total)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* 내비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-sm font-medium"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 로그아웃 */}
        <div className="px-3 py-4 border-t border-gray-100">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-sm"
            >
              <span>🚪</span>
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}

function nextMilestoneXP(currentXP: number): number {
  if (currentXP < 200) return 200
  if (currentXP < 500) return 500
  return 1000
}
