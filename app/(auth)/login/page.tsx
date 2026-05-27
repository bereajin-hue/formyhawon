'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('로그인 링크 전송에 실패했습니다. 이메일 주소를 확인해주세요.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Scholar Quest</h1>
          <p className="text-gray-500 text-sm mt-1">IGCSE 학생을 위한 30일 프로젝트</p>
        </div>

        {sent ? (
          /* 이메일 전송 완료 화면 */
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
              <span className="text-2xl">✉️</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">이메일을 확인해주세요!</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              <span className="font-medium text-indigo-600">{email}</span>으로<br />
              로그인 링크를 보냈습니다.<br />
              이메일의 링크를 클릭하면 바로 입장합니다.
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-6 text-sm text-indigo-500 hover:text-indigo-700 underline"
            >
              다른 이메일로 시도하기
            </button>
          </div>
        ) : (
          /* 로그인 폼 */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 주소
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="예: student@gmail.com"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-gray-800 placeholder-gray-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  전송 중...
                </span>
              ) : '로그인 링크 받기'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              비밀번호 없이 이메일 링크 하나로 로그인합니다
            </p>
          </form>
        )}
      </div>

      {/* 안내 문구 */}
      <p className="text-center text-xs text-gray-400 mt-6">
        처음 접속 시 프로필 설정이 필요합니다
      </p>
    </div>
  )
}
