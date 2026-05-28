'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'
import type { Book, VocabSession, VocabWord, VocabCorrection } from '@/types'

interface Props {
  readingBooks: Book[]
  todaySession: VocabSession | null
}

const SCORE_CONFIG = [
  { label: '오답', enLabel: 'Incorrect', color: 'bg-red-400' },
  { label: '부분 정답', enLabel: 'Partial', color: 'bg-orange-400' },
  { label: '정답', enLabel: 'Correct', color: 'bg-yellow-400' },
  { label: '우수', enLabel: 'Good', color: 'bg-green-400' },
  { label: '완벽', enLabel: 'Perfect', color: 'bg-purple-400' },
]

export default function VocabClient({ readingBooks, todaySession }: Props) {
  const { t, lang } = useT()
  const [status, setStatus] = useState<'select' | 'writing' | 'checking' | 'done'>(
    todaySession?.completed ? 'done' : todaySession ? 'writing' : 'select'
  )
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [words, setWords] = useState<VocabWord[]>(todaySession?.words ?? [])
  const [sentences, setSentences] = useState<Record<string, string>>(todaySession?.sentences ?? {})
  const [corrections, setCorrections] = useState<VocabCorrection[]>(todaySession?.ai_corrections ?? [])
  const [xpEarned, setXpEarned] = useState(0)
  const [loading, setLoading] = useState(false)

  async function handleStartSession() {
    if (!selectedBook) return
    setLoading(true)
    const res = await fetch('/api/vocab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: selectedBook.id }),
    })
    const data = await res.json()
    if (data.words) {
      setWords(data.words)
      setStatus('writing')
    }
    setLoading(false)
  }

  async function handleCheckAnswers() {
    if (words.some((w) => !sentences[w.word]?.trim())) {
      alert(t(T.vocab.needAllSentences))
      return
    }
    setStatus('checking')
    const res = await fetch('/api/ai/vocab-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words: words.map((w) => ({ ...w, sentence: sentences[w.word] ?? '' })) }),
    })
    const checkData = await res.json()

    const patchRes = await fetch('/api/vocab', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentences, corrections: checkData.results }),
    })
    const patchData = await patchRes.json()

    setCorrections(checkData.results ?? [])
    setXpEarned(patchData.xpEarned ?? 10)
    setStatus('done')
  }

  const avgScore = corrections.length > 0
    ? corrections.reduce((s, c) => s + c.score, 0) / corrections.length
    : 0

  if (status === 'done' && corrections.length > 0) {
    return (
      <div className="max-w-3xl">
        <div className="mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 text-white text-center shadow-md">
          <p className="text-2xl font-bold mb-1">{t(T.vocab.sessionComplete)}</p>
          <p className="text-4xl font-black my-2">{avgScore.toFixed(1)} / 5.0</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-sm opacity-80">{t(T.vocab.xpEarned)}</span>
            <span className="font-bold text-lg">+{xpEarned > 0 ? xpEarned : 10}</span>
          </div>
        </div>

        <div className="space-y-4">
          {words.map((word, i) => {
            const correction = corrections[i]
            if (!correction) return null
            const scoreIdx = Math.min(4, Math.max(0, Math.round(correction.score) - 1))
            const scoreInfo = SCORE_CONFIG[scoreIdx]

            return (
              <div key={word.word} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-bold text-indigo-700 text-lg">{word.word}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{word.definition}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${scoreInfo.color}`}>
                      {lang === 'ko' ? scoreInfo.label : scoreInfo.enLabel} {correction.score}/5
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className={`flex-1 h-2 rounded-full ${n <= correction.score ? scoreInfo.color : 'bg-gray-100'}`} />
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">{t(T.vocab.mySentence)}</p>
                    <p className="text-sm text-gray-700">{sentences[word.word]}</p>
                  </div>
                  {!correction.is_correct && correction.corrected_sentence && (
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs font-medium text-blue-500 mb-1">{t(T.vocab.correctedSentence)}</p>
                      <p className="text-sm text-blue-700">{correction.corrected_sentence}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 leading-relaxed">{correction.explanation}</p>
                  <p className="text-xs text-indigo-600 font-medium">{correction.encouragement}</p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">{t(T.vocab.tomorrow)}</p>
      </div>
    )
  }

  if (status === 'writing' || status === 'checking') {
    return (
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">{t(T.vocab.title)}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t(T.vocab.subtitle)}</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-6 text-sm text-indigo-700">
          {t(T.vocab.tip)}
        </div>

        <div className="space-y-4 mb-6">
          {words.map((word, i) => (
            <div key={word.word} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-bold text-indigo-700 text-lg">{word.word}</span>
                  <p className="text-sm text-gray-500 mt-0.5">{word.definition}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {T.vocab.wordProgress(i + 1, words.length)}
                </span>
              </div>
              {word.example && (
                <p className="text-xs text-gray-400 italic border-l-2 border-indigo-200 pl-2 mb-3">
                  <span className="font-medium not-italic text-gray-500">{t(T.vocab.bookExample)}</span> {word.example}
                </p>
              )}
              <textarea
                value={sentences[word.word] ?? ''}
                onChange={(e) => setSentences((prev) => ({ ...prev, [word.word]: e.target.value }))}
                placeholder={T.vocab.sentencePlaceholder(word.word, lang)}
                rows={2}
                disabled={status === 'checking'}
                className="w-full text-sm text-gray-800 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none placeholder-gray-300 disabled:bg-gray-50"
              />
            </div>
          ))}
        </div>

        {status === 'checking' ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
            <p className="text-indigo-600 font-medium">{t(T.vocab.checking)}</p>
            <p className="text-xs text-gray-400 mt-1">{T.vocab.checkingDesc(words.length, lang)}</p>
          </div>
        ) : (
          <button
            onClick={handleCheckAnswers}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all active:scale-95"
          >
            {t(T.vocab.checkAnswers)}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{t(T.vocab.title)}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t(T.vocab.subtitle)}</p>
      </div>

      {readingBooks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📚</p>
          <p className="font-medium text-gray-600">{t(T.vocab.noBooks)}</p>
          <p className="text-sm mt-1">{t(T.vocab.noBooksDesc)}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="font-medium text-gray-700 mb-4">{t(T.vocab.selectPrompt)}</p>
          <div className="space-y-2 mb-6">
            {readingBooks.map((book) => (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  selectedBook?.id === book.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <p className="font-medium text-gray-800">{book.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleStartSession}
            disabled={!selectedBook || loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all active:scale-95"
          >
            {loading ? t(T.vocab.preparing) : t(T.vocab.start)}
          </button>
        </div>
      )}
    </div>
  )
}
