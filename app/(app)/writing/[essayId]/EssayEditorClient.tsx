'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import FeedbackPanel from '@/components/writing/FeedbackPanel'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'
import type { Profile, EssayFeedback } from '@/types'

interface AvailableBook { id: string; title: string; author: string }

interface Props {
  profile: Profile
  essayId: string | null
  initialContent: string
  promptText: string
  bookId: string | null
  bookTitle: string
  bookAuthor?: string
  existingFeedback: EssayFeedback | null
  availableBooks?: AvailableBook[]
}

export default function EssayEditorClient({
  profile, essayId, initialContent, promptText, bookId: initialBookId,
  bookTitle: initialBookTitle, bookAuthor: initialBookAuthor = '',
  existingFeedback, availableBooks = [],
}: Props) {
  const router = useRouter()
  const { t, lang } = useT()
  const [content, setContent] = useState(initialContent)
  const [prompt, setPrompt] = useState(promptText)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(initialBookId)
  const [bookTitle, setBookTitle] = useState(initialBookTitle)
  const [feedback, setFeedback] = useState<EssayFeedback | null>(existingFeedback)
  const [xpEarned, setXpEarned] = useState(0)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'analyzing' | 'done'>('idle')
  const [xpPopup, setXpPopup] = useState<number | null>(null)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [questionHint, setQuestionHint] = useState('')
  const savedEssayId = useRef<string | null>(essayId)

  function handleBookSelect(bookId: string) {
    const book = availableBooks.find((b) => b.id === bookId)
    if (book) {
      setSelectedBookId(book.id)
      setBookTitle(book.title)
      setPrompt('')
      setQuestionHint('')
    }
  }

  async function handleGenerateQuestion() {
    if (!selectedBookId && !bookTitle) return
    setQuestionLoading(true)
    setQuestionHint('')
    try {
      const res = await fetch('/api/ai/essay-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookTitle, bookAuthor: initialBookAuthor, bookId: selectedBookId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPrompt(data.question)
      setQuestionHint(data.hint)
    } catch (err) {
      alert(err instanceof Error ? err.message : t(T.essayEditor.questionError))
    }
    setQuestionLoading(false)
  }

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
      setStatus('saving')
      let currentEssayId = savedEssayId.current
      const isRevision = !!currentEssayId

      if (!currentEssayId) {
        const res = await fetch('/api/essays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId: selectedBookId, promptText: prompt, content }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        currentEssayId = data.id
        savedEssayId.current = data.id
      }

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
      alert(err instanceof Error ? err.message : t(T.essayEditor.generalError))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-6xl relative">
      {xpPopup !== null && (
        <div className="fixed top-8 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg animate-bounce font-bold text-lg">
          +{xpPopup} XP! ✨
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">{t(T.common.back)}</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t(T.essayEditor.title)}</h1>
            {bookTitle && <p className="text-xs text-indigo-500 mt-0.5">📚 {bookTitle}</p>}
          </div>
        </div>
        {!essayId && availableBooks.length > 0 && !initialBookId && (
          <select
            onChange={(e) => handleBookSelect(e.target.value)}
            defaultValue=""
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="" disabled>{t(T.essayEditor.selectBook)}</option>
            {availableBooks.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">{t(T.essayEditor.questionLabel)}</label>
              {selectedBookId && (
                <button
                  onClick={handleGenerateQuestion}
                  disabled={questionLoading || loading}
                  className="flex items-center gap-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-full transition-all disabled:opacity-50 font-medium"
                >
                  {questionLoading ? (
                    <>
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      {t(T.common.generating)}
                    </>
                  ) : (
                    <>{t(T.essayEditor.getAiQuestion)}</>
                  )}
                </button>
              )}
            </div>
            {prompt ? (
              <div>
                <p className="text-gray-800 leading-relaxed text-sm">{prompt}</p>
                {questionHint && (
                  <p className="text-xs text-purple-500 mt-2 bg-purple-50 rounded-lg px-3 py-2">
                    {t(T.essayEditor.hint)} {questionHint}
                  </p>
                )}
                {!promptText && (
                  <button
                    onClick={() => { setPrompt(''); setQuestionHint('') }}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-2"
                  >
                    {t(T.essayEditor.typeManually)}
                  </button>
                )}
              </div>
            ) : (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={T.essayEditor.questionPlaceholder(!!selectedBookId, lang)}
                rows={3}
                className="w-full text-sm text-gray-800 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">{t(T.essayEditor.myEssay)}</label>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${wordCount >= 400 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {T.essayEditor.wordCount(wordCount, lang)}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t(T.essayEditor.essayPlaceholder)}
              rows={18}
              className="w-full text-sm text-gray-800 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none leading-relaxed"
            />
          </div>

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
                {status === 'saving' ? t(T.common.saving) : t(T.essayEditor.analyzing)}
              </span>
            ) : feedback ? t(T.essayEditor.getRevisionFeedback) : t(T.essayEditor.getFeedback)}
          </button>

          {!canSubmit && (
            <p className="text-xs text-center text-gray-400">
              {!prompt.trim() ? t(T.essayEditor.needQuestion) : T.essayEditor.needWords(400 - wordCount, lang)}
            </p>
          )}
        </div>

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
                  <p className="text-indigo-600 font-medium">{t(T.essayEditor.claudeReading)}</p>
                  <p className="text-xs text-gray-400 mt-1">{t(T.essayEditor.igcseEval)}</p>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-3">🎯</p>
                  <p className="text-gray-500 font-medium">{t(T.essayEditor.feedbackResult)}</p>
                  <p className="text-xs text-gray-400 mt-1">{t(T.essayEditor.feedbackInstruction)}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
