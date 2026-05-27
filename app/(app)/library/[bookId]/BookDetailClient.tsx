'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'
import type { Book, Profile, BookQuestContent } from '@/types'

interface Props {
  book: Book
  profile: Profile
  initialContent: BookQuestContent | null
}

export default function BookDetailClient({ book, profile, initialContent }: Props) {
  const router = useRouter()
  const { t, lang } = useT()
  const [activeTab, setActiveTab] = useState('background')
  const [content, setContent] = useState<BookQuestContent | null>(initialContent)
  const [loading, setLoading] = useState(!initialContent)
  const [error, setError] = useState('')
  const [readingXpPopup, setReadingXpPopup] = useState(false)

  const TABS = [
    { id: 'background', label: t(T.bookDetail.background) },
    { id: 'themes', label: t(T.bookDetail.themes) },
    { id: 'essays', label: t(T.bookDetail.essayQuestions) },
    { id: 'chapters', label: t(T.bookDetail.chapterQuestions) },
    { id: 'vocab', label: t(T.bookDetail.vocab) },
  ]

  const DIFFICULTY_LABEL: Record<string, string> = {
    easy: t(T.bookDetail.easy),
    medium: t(T.bookDetail.medium),
    hard: t(T.bookDetail.hard),
  }

  const DIFFICULTY_STYLE: Record<string, string> = {
    easy: 'bg-green-100 text-green-600',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-600',
  }

  useEffect(() => {
    if (!initialContent) generateContent()
  }, [])

  async function generateContent() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/book-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          grade: book.grade_level ?? profile.grade ?? 10,
          bookId: book.id,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setContent(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(T.bookDetail.aiError))
    }
    setLoading(false)
  }

  async function handleTabChange(tabId: string) {
    setActiveTab(tabId)
    if (tabId === 'chapters') {
      const res = await fetch('/api/missions/reading-complete', { method: 'POST' })
      const data = await res.json()
      if (data.xpEarned > 0) {
        setReadingXpPopup(true)
        setTimeout(() => setReadingXpPopup(false), 2500)
      }
    }
  }

  function handleStartEssay(question: string) {
    const params = new URLSearchParams({ bookId: book.id, prompt: question })
    router.push(`/writing/new?${params.toString()}`)
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-start gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 mt-1">
          {t(T.common.back)}
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
          <p className="text-gray-500 mt-0.5">{book.author} · {T.bookDetail.gradeLabel(book.grade_level ?? profile.grade ?? 10, lang)}</p>
        </div>
      </div>

      {loading && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-10 text-center">
          <div className="flex justify-center mb-4">
            <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
          <p className="font-semibold text-indigo-700 text-lg">{t(T.bookDetail.generating)}</p>
          <p className="text-indigo-400 text-sm mt-1">{t(T.bookDetail.generatingDesc)}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={generateContent} className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
            {t(T.common.retry)}
          </button>
        </div>
      )}

      {readingXpPopup && (
        <div className="fixed top-8 right-8 z-50 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-lg animate-bounce font-bold text-lg">
          +10 XP! 📖 {lang === 'ko' ? '독서 미션 완료!' : 'Reading mission done!'}
        </div>
      )}

      {content && !loading && (
        <>
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'background' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">🏛️</span> {t(T.bookDetail.historicalContext).replace('🏛️ ', '')}
                </h3>
                <p className="text-gray-600 leading-relaxed">{content.background.historical_context}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">✍️</span> {t(T.bookDetail.authorBio).replace('✍️ ', '')}
                </h3>
                <p className="text-gray-600 leading-relaxed">{content.background.author_bio}</p>
              </div>
              {content.background.allegory_map?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-lg">🗺️</span> {t(T.bookDetail.allegoryMap).replace('🗺️ ', '')}
                  </h3>
                  <div className="space-y-2">
                    {content.background.allegory_map.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-indigo-700 min-w-[120px] text-sm">{item.character_or_symbol}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600 text-sm">{item.real_world_meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="space-y-4">
              {content.themes.map((theme, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{theme.name}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{theme.description}</p>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{t(T.bookDetail.keyScenes)}</p>
                    <div className="space-y-1.5">
                      {theme.key_scenes.map((scene, j) => (
                        <div key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          <span>{scene}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'essays' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">{t(T.bookDetail.clickForEssay)}</p>
              {content.essay_prompts.map((ep, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => handleStartEssay(ep.question)}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${DIFFICULTY_STYLE[ep.difficulty]}`}>
                      {DIFFICULTY_LABEL[ep.difficulty]}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium leading-relaxed group-hover:text-indigo-700 transition-colors">
                        {ep.question}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{t(T.bookDetail.focus)}: {ep.focus}</p>
                    </div>
                    <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">→</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="space-y-4">
              {Object.entries(content.chapter_questions).map(([chapter, questions]) => (
                <div key={chapter} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-800 mb-3">{chapter}</h3>
                  <div className="space-y-2">
                    {questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600 p-2 hover:bg-gray-50 rounded-lg">
                        <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'vocab' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.vocab_spotlight.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-bold text-indigo-700 text-lg">{item.word}</span>
                    <span className="text-xs bg-indigo-50 text-indigo-500 px-2 py-1 rounded-full">C1</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.definition}</p>
                  <p className="text-xs text-gray-400 italic border-l-2 border-indigo-200 pl-2">{item.usage}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
