'use client'

import { useState } from 'react'
import type { Profile, VocabSession } from '@/types'

interface SimpleBook { id: string; title: string; author: string }

interface CheckResult {
  word: string
  score: number
  is_correct: boolean
  corrected_sentence: string
  explanation: string
  encouragement: string
}

interface Props {
  profile: Profile
  books: SimpleBook[]
  todaySession: VocabSession | null
}

const SCORE_CONFIG = [
  { label: '오답', color: 'bg-red-100 text-red-600', bar: 'bg-red-400' },
  { label: '부분 정답', color: 'bg-orange-100 text-orange-600', bar: 'bg-orange-400' },
  { label: '정답', color: 'bg-yellow-100 text-yellow-600', bar: 'bg-yellow-400' },
  { label: '우수', color: 'bg-green-100 text-green-600', bar: 'bg-green-500' },
  { label: '완벽', color: 'bg-purple-100 text-purple-600', bar: 'bg-purple-500' },
]

export default function VocabClient({ profile, books, todaySession }: Props) {
  const [session, setSession] = useState<VocabSession | null>(todaySession)
  const [sentences, setSentences] = useState<Record<string, string>>({})
  const [results, setResults] = useState<CheckResult[] | null>(
    todaySession?.ai_corrections
      ? (todaySession.ai_corrections as unknown as CheckResult[])
      : null
  )
  const [status, setStatus] = useState<'select' | 'writing' | 'checking' | 'done'>(
    todaySession?.completed ? 'done' : todaySession ? 'writing' : 'select'
  )
  const [xpEarned, setXpEarned] = useState(0)
  const [xpPopup, setXpPopup] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  function showXpPopup() {
    setXpPopup(true)
    setTimeout(() => setXpPopup(false), 3000)
  }

  async function handleStartSession(bookId: string) {
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSession(data.session)
      setStatus('writing')
    } catch (err) {
      setError(err instanceof Error ? err.message : '세션 시작 오류')
    }
    setCreating(false)
  }

  async function handleSubmit() {
    if (!session) return
    const words = session.words as Array<{ word: string; definition: string; example: string }>
    const allFilled = words.every((w) => sentences[w.word]?.trim())
    if (!allFilled) {
      setError('모든 단어에 예문을 입력해주세요')
      return
    }
    setStatus('checking')
    setError('')
    try {
      const payload = words.map((w) => ({
        word: w.word,
        definition: w.definition,
        sentence: sentences[w.word],
      }))
      const checkRes = await fetch('/api/ai/vocab-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: payload }),
      })
      const checkData = await checkRes.json()
      if (checkData.error) throw new Error(checkData.error)

      const corrections = checkData.results as CheckResult[]
      const saveRes = await fetch('/api/vocab', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, sentences, corrections }),
      })
      const saveData = await saveRes.json()
      if (saveData.xpEarned > 0) {
        setXpEarned(saveData.xpEarned)
        showXpPopup()
      }
      setResults(corrections)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : '채점 오류가 발생했습니다')
      setStatus('writing')
    }
  }

  const words = session?.words as Array<{ word: string; definition: string; example: string }> | undefined
  const avgScore = results ? results.reduce((s, r) => s + r.score, 0) / results.length : 0

  return (
    <div className="max-w-3xl relative">
      {xpPopup && (
        <div className="fixed top-8 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg animate-bounce font-bold text-lg">
          +{xpEarned} XP! ✨
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">🔤 어휘 세션</h1>
        <p className="text-sm text-gray-400 mt-0.5">책에서 뽑은 핵심 단어로 나만의 예문을 써보세요</p>
      </div>

      {/* 책 선택 */}
      {status === 'select' && (
        <div>
          {books.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-gray-500 font-medium">읽고 있는 책이 없어요</p>
              <p className="text-xs text-gray-400 mt-1">라이브러리에서 책을 추가하고 학습을 시작하세요</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">오늘 어떤 책의 단어를 공부할까요?</p>
              <div className="space-y-3">
                {books.map((book) => (
                  <div key={book.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{book.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
                    </div>
                    <button
                      onClick={() => handleStartSession(book.id)}
                      disabled={creating}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                      {creating ? '준비 중...' : '시작하기'}
                    </button>
                  </div>
                ))}
              </div>
              {error && <p className="text-sm text-red-500 mt-3 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
            </div>
          )}
        </div>
      )}

      {/* 문장 작성 */}
      {status === 'writing' && words && (
        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-xl px-4 py-3 text-sm text-indigo-700 font-medium">
            💡 각 단어를 사용해서 나만의 문장을 완성하세요. 문장이 길수록 더 좋아요!
          </div>
          {words.map((w, i) => (
            <div key={w.word} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">{i + 1} / {words.length}</span>
                    <h3 className="text-lg font-bold text-gray-900">{w.word}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{w.definition}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3 text-xs text-gray-500 leading-relaxed">
                <span className="font-medium text-gray-600">책 예문: </span>{w.example}
              </div>
              <textarea
                value={sentences[w.word] ?? ''}
                onChange={(e) => setSentences((prev) => ({ ...prev, [w.word]: e.target.value }))}
                placeholder={`"${w.word}"를 사용한 나만의 영어 문장을 써보세요...`}
                rows={2}
                className="w-full text-sm text-gray-800 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={!words.every((w) => sentences[w.word]?.trim())}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed"
          >
            채점하기 ✨
          </button>
        </div>
      )}

      {/* 채점 중 */}
      {status === 'checking' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <svg className="animate-spin h-10 w-10 text-indigo-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-indigo-600 font-medium">Claude가 문장을 확인하고 있어요...</p>
          <p className="text-xs text-gray-400 mt-1">단어 {words?.length ?? 5}개를 동시에 채점합니다</p>
        </div>
      )}

      {/* 결과 */}
      {status === 'done' && results && (
        <div className="space-y-4">
          {/* 총점 카드 */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-100">오늘의 어휘 세션 완료!</p>
                <p className="text-3xl font-bold mt-1">
                  {avgScore.toFixed(1)} <span className="text-lg font-normal text-indigo-200">/ 5.0</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-indigo-200 text-sm">획득 XP</p>
                <p className="text-2xl font-bold">+{xpEarned > 0 ? xpEarned : 15}</p>
              </div>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${(avgScore / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* 개별 결과 */}
          {results.map((r, i) => {
            const cfg = SCORE_CONFIG[r.score - 1] ?? SCORE_CONFIG[0]
            return (
              <div key={r.word} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{i + 1}</span>
                    <h3 className="font-bold text-gray-900">{r.word}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={`w-5 h-2 rounded-full ${s <= r.score ? cfg.bar : 'bg-gray-100'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* 내 문장 */}
                <div className="bg-gray-50 rounded-xl px-3 py-2 mb-2 text-sm text-gray-600">
                  <span className="text-xs text-gray-400 font-medium block mb-0.5">내 문장</span>
                  {(session?.sentences as Record<string, string> | undefined)?.[r.word] ?? ''}
                </div>

                {/* 교정 문장 (오답일 때만) */}
                {!r.is_correct && (
                  <div className="bg-green-50 rounded-xl px-3 py-2 mb-2 text-sm text-green-700">
                    <span className="text-xs text-green-500 font-medium block mb-0.5">교정 문장</span>
                    {r.corrected_sentence}
                  </div>
                )}

                <p className="text-xs text-gray-500 mb-1">{r.explanation}</p>
                <p className="text-xs text-indigo-500 font-medium">{r.encouragement}</p>
              </div>
            )
          })}

          <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
            <p className="text-gray-400 text-sm">내일 다시 새로운 단어 세션이 시작됩니다 🎯</p>
          </div>
        </div>
      )}
    </div>
  )
}
