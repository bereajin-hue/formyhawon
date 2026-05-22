import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/setup')
  if (profile.role === 'parent') redirect('/parent')

  const today = new Date()
  const dayNumber = 1 // 추후 실제 계산으로 교체

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          안녕하세요, {profile.name}님! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          오늘은 <span className="font-semibold text-indigo-600">Day {dayNumber} / 30</span>입니다
        </p>
      </div>

      {/* 미션 카드 (플레이스홀더) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: '🔤', title: '어휘 세션 완료', desc: 'EN 30개 + 문장 쓰기', xp: 20, done: false },
          { icon: '📖', title: '독서 기록', desc: '30분 이상 + 챕터 질문', xp: 15, done: false },
          { icon: '✍️', title: '에세이 쓰기', desc: '에세이 문단 작성', xp: 15, done: false },
        ].map((mission, i) => (
          <div key={i} className={`bg-white rounded-xl border p-5 ${mission.done ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{mission.icon}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${mission.done ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                +{mission.xp} XP
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">{mission.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{mission.desc}</p>
            <div className={`mt-3 h-1.5 rounded-full ${mission.done ? 'bg-green-400' : 'bg-gray-100'}`} />
          </div>
        ))}
      </div>

      {/* XP 상태 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">XP 현황</h2>
          <span className="text-2xl font-bold text-indigo-600">{profile.xp_total} XP</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, (profile.xp_total / 200) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">첫 번째 마일스톤까지 {Math.max(0, 200 - profile.xp_total)} XP 남음</p>
      </div>

      {/* 안내 배너 */}
      <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-5">
        <p className="text-sm text-indigo-700 font-medium">🚀 Scholar Quest에 오신 것을 환영합니다!</p>
        <p className="text-xs text-indigo-500 mt-1">
          먼저 <a href="/library" className="underline font-medium">책 라이브러리</a>에서 읽고 있는 책을 추가해보세요.
          Claude AI가 맞춤형 학습 자료를 생성해드립니다.
        </p>
      </div>
    </div>
  )
}
