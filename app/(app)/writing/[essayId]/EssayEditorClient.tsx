'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import FeedbackPanel from '@/components/writing/FeedbackPanel'
import type { Profile, EssayFeedback } from '@/types'

interface Props {
  profile: Profile
  essayId: string | null
  initialContent: string
  promptText: string
  bookId: string | null
  bookTitle: string
  existingFeedback: EssayFeedback | null
}

export default function EssayEditorClient({
  profile, essayId, initialContent, promptText, bookId, bookTitle, existingFeedback,
}: Props) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [prompt, setPrompt] = useState(promptText)
  const [feedback, setFeedback] = useState<EssayFeedback | null>(existingFeedback)
  const [xpEarned, setXpEarned] = useState(0)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'analyzing' | 'done'>('idle')
  const [xpPopup, setXpPopup] = useState<number | null>(null)
  const savedEssayId = useRef<string | null>(essayId)

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const canSubmit = wordCount >= 400 && prompt.trim().length > 0

  function showXpPopup(amount: number) {
    setXpPopup(amount)
    setTimeout(() => setXpPopup(null), 3000)
  }

  async function handleSubmitAndAnalyze() {
    if (!canSubmit) return
    setLoading(true)
    setFeedback(null)

    try {
      // 1. 에세이 저장
      setStatus('saving')
      let currentEssayId = savedEssayId.current
      const isRevision = !!currentEssayId

      if (!currentEssayId) {
        const res = await fetch('/api/essays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, promptText: prompt, content }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        currentEssayId = data.id
        savedEssayId.current = data.id
      }

      // 2. AI 첨삭
      setStatus('analyzing')
      const feedbackRes = await fetch('/api/ai/essay-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay: content,
          prompt,
          bookTitle: bookTitle || '(책 없음)',
          grade: profile.grade ?? 10,
        }),
      })

      const feedbackData = await feedbackRes.json()
      if (feedbackData.error) throw new Error(feedbackData.error)

      const parsedFeedback: EssayFeedback = feedbackData.feedback
      setFeedback(parsedFeedback)

      // 3. 피드백 + XP 저장
      const saveRes = await fetch('/api/essays', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayId: currentEssayId,
          content,
          aiFeedback: parsedFeedback,
          xpBonus: parsedFeedback.xp_bonus,
          isRevision,
        }),
      })
      const saveData = await saveRes.json()
      if (saveData.xpEarned > 0) {
        setXpEarned(saveData.xpEarned)
        showXpPopup(saveData.xpEarned)
      }

      setStatus('done')
      if (!essayId && currentEssayId) {
        router.replace(`/writing/${currentEssayId}`)
      }
    } catch (err) {
      setStatus('idle')
      alert(err instanceof Error ? err.message : '오류가 발생했습니다')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-6xl relative">
      {/* XP 팝업 */}
      {xpPopup !== null && (
        <div className="fixed top-8 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg animate-bounce font-bold text-lg">
          +{xpPopup} XP! ✨
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">← 뒤로</button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">✍️ 에세이 에디터</h1>
          {bookTitle && <p className="text-xs text-indigo-500 mt-0.5">📚 {bookTitle}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 에디터 */}
        <div className="space-y-4">
          {/* 질문 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">에세이 질문</label>
            {promptText ? (
              <p className="text-gray-800 leading-relaxed text-sm">{prompt}</p>
            ) : (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="에세이 질문을 입력하세요..."
                rows={3}
                className="w-full text-sm text-gray-800 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            )}
          </div>

          {/* 에디터 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">내 에세이</label>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${wordCount >= 400 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {wordCount} / 400단어 {wordCount >= 400 ? '✓' : ''}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="여기에 에세이를 작성하세요. 최소 400단어 이상 작성해야 AI 첨삭을 받을 수 있어요."
              rows={18}
              className="w-full text-sm text-gray-800 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none leading-relaxed"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmitAndAnalyze}
            disabled={!canSubmit || loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {status === 'saving' ? '저장 중...' : 'Claude가 첨삭 중...'}
              </span>
            ) : feedback ? '다시 첨삭 받기 (+30 XP)' : 'AI 첨삭 받기 (+50 XP)'}
          </button>

          {!canSubmit && (
            <p className="text-xs text-center text-gray-400">
              {!prompt.trim() ? '에세이 질문을 입력해주세요' : `${400 - wordCount}단어 더 작성해야 해요`}
            </p>
          )}
        </div>

        {/* 오른쪽: 피드백 */}
        <div>
          {feedback ? (
            <FeedbackPanel feedback={feedback} xpEarned={xpEarned} />
          ) : (
            <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center h-full flex flex-col items-center justify-center">
              {loading && status === 'analyzing' ? (
                <>
                  <svg className="animate-spin h-8 w-8 text-indigo-400 mb-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <p className="text-indigo-600 font-medium">Claude가 에세이를 읽고 있어요...</p>
                  <p className="text-xs text-gray-400 mt-1">IGCSE 기준으로 5가지 항목을 평가합니다</p>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-3">🎯</p>
                  <p className="text-gray-500 font-medium">AI 첨삭 결과</p>
                  <p className="text-xs text-gray-400 mt-1">400단어 이상 작성 후<br />AI 첨삭 받기 버튼을 클릭하세요</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
