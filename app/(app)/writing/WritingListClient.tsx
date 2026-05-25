'use client'

import Link from 'next/link'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'

interface Essay {
  id: string
  prompt_text: string
  word_count?: number
  revision_count: number
  submitted_at: string
  ai_feedback?: { scores: Record<string, { score: number }> } | null
  books?: { title: string } | null
}

interface Props {
  essays: Essay[]
}

export default function WritingListClient({ essays }: Props) {
  const { t, lang } = useT()

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t(T.writingList.title)}</h1>
          <p className="text-gray-500 text-sm mt-1">{T.writingList.count(essays.length, lang)}</p>
        </div>
        <Link
          href="/writing/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-sm"
        >
          {t(T.writingList.newEssay)}
        </Link>
      </div>

      {essays.length > 0 ? (
        <div className="space-y-3">
          {essays.map((essay) => {
            const avg = essay.ai_feedback
              ? Object.values(essay.ai_feedback.scores).reduce((s, v) => s + v.score, 0) / 5
              : null
            return (
              <Link key={essay.id} href={`/writing/${essay.id}`}>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 line-clamp-2">{essay.prompt_text}</p>
                      {essay.books && (
                        <p className="text-xs text-indigo-500 mt-1">📚 {essay.books.title}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>{T.writingList.words(essay.word_count ?? 0, lang)}</span>
                        {essay.revision_count > 0 && (
                          <span>{T.writingList.revisions(essay.revision_count, lang)}</span>
                        )}
                        <span>{new Date(essay.submitted_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {avg !== null ? (
                        <span className="text-sm font-bold text-indigo-600">{avg.toFixed(1)}/4.0</span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">{t(T.writingList.notGraded)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">✍️</p>
          <p className="font-medium text-gray-600">{t(T.writingList.empty)}</p>
          <p className="text-sm mt-1">{t(T.writingList.emptyDesc)}</p>
          <Link href="/writing/new" className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
            {t(T.writingList.writeFirst)}
          </Link>
        </div>
      )}
    </div>
  )
}
