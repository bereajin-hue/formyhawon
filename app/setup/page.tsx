'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t, lang, setLang } = useT()
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
      setError(t(T.setup.error))
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
        {/* 상단 바: 로그아웃 + 언어 토글 */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setLang('ko')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                lang === 'ko' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              🇰🇷 KO
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                lang === 'en' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              🇺🇸 EN
            </button>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/login')
            }}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            {t(T.setup.logout)}
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t(T.setup.title)}</h1>
          <p className="text-gray-500 text-sm mt-1">{t(T.setup.subtitle)}</p>
        </div>

        {step === 'role' ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 text-center">{t(T.setup.whoAmI)}</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setRole('student'); setStep('details') }}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl transition-all"
              >
                <span className="text-4xl">🎓</span>
                <span className="font-medium text-gray-700">{t(T.setup.student)}</span>
                <span className="text-xs text-gray-400">{t(T.setup.studentDesc)}</span>
              </button>
              <button
                onClick={() => { setRole('parent'); setStep('details') }}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl transition-all"
              >
                <span className="text-4xl">👨‍👩‍👧</span>
                <span className="font-medium text-gray-700">{t(T.setup.parent)}</span>
                <span className="text-xs text-gray-400">{t(T.setup.parentDesc)}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(T.setup.name)}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(T.setup.namePlaceholder)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 placeholder-gray-400"
              />
            </div>

            {role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t(T.setup.gradeLabel)}</label>
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
                      {T.setup.gradeOption(g, lang)}
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
                {t(T.setup.back)}
              </button>
              <button
                type="submit"
                disabled={loading || !name || (role === 'student' && !grade)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-3 rounded-xl transition-all active:scale-95"
              >
                {loading ? t(T.common.saving) : t(T.setup.start)}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
