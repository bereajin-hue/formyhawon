'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [role, setRole] = useState<'student' | 'parent' | null>(null)
  const [name, setName] = useState('')
  const [grade, setGrade] = useState<8 | 10 | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role || !name) return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const profileData: Record<string, unknown> = {
      user_id: user.id,
      role,
      name,
      xp_total: 0,
      streak_days: 0,
    }
    if (role === 'student' && grade) profileData.grade = grade

    const { error: insertError } = await supabase.from('profiles').insert(profileData)

    if (insertError) {
      setError('프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요.')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
          <p className="text-gray-500 text-sm mt-1">처음 방문하셨군요! 프로필을 만들어주세요.</p>
        </div>

        {step === 'role' ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 text-center">나는 누구인가요?</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setRole('student'); setStep('details') }}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl transition-all"
              >
                <span className="text-4xl">🎓</span>
                <span className="font-medium text-gray-700">학생</span>
                <span className="text-xs text-gray-400">8학년 / 10학년</span>
              </button>
              <button
                onClick={() => { setRole('parent'); setStep('details') }}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl transition-all"
              >
                <span className="text-4xl">👨‍👩‍👧</span>
                <span className="font-medium text-gray-700">부모</span>
                <span className="text-xs text-gray-400">자녀 진행 관리</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김지수"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 placeholder-gray-400"
              />
            </div>

            {role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">학년</label>
                <div className="grid grid-cols-2 gap-3">
                  {([8, 10] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`py-3 px-4 border-2 rounded-xl font-medium transition-all ${
                        grade === g
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {g}학년
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('role')}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
              >
                뒤로
              </button>
              <button
                type="submit"
                disabled={loading || !name || (role === 'student' && !grade)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-3 rounded-xl transition-all active:scale-95"
              >
                {loading ? '저장 중...' : '시작하기 🚀'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
