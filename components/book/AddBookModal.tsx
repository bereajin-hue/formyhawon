'use client'

import { useState, useEffect } from 'react'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'

interface RecommendedBook {
  id: string
  title: string
  author: string
  difficulty: 'accessible' | 'standard' | 'challenging'
  is_core: boolean
}

interface AddBookModalProps {
  onClose: () => void
  onAdd: (title: string, author: string) => Promise<void>
  grade?: number
}

const DIFFICULTY_COLOR = {
  accessible: 'bg-green-100 text-green-700 border-green-200',
  standard: 'bg-blue-100 text-blue-700 border-blue-200',
  challenging: 'bg-orange-100 text-orange-700 border-orange-200',
}

const DIFFICULTY_LABEL = {
  accessible: { ko: '입문', en: 'Intro' },
  standard: { ko: '표준', en: 'Standard' },
  challenging: { ko: '심화', en: 'Advanced' },
}

export default function AddBookModal({ onClose, onAdd, grade }: AddBookModalProps) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recommended, setRecommended] = useState<RecommendedBook[]>([])
  const [loadingRec, setLoadingRec] = useState(false)
  const { t, lang } = useT()

  useEffect(() => {
    if (!grade) return
    setLoadingRec(true)
    fetch(`/api/curriculum/books?grade=${grade}`)
      .then((r) => r.json())
      .then((data) => setRecommended(data.books ?? []))
      .catch(() => {})
      .finally(() => setLoadingRec(false))
  }, [grade])

  function handlePick(book: RecommendedBook) {
    setTitle(book.title)
    setAuthor(book.author)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !author.trim()) return
    setLoading(true)
    setError('')
    try {
      await onAdd(title.trim(), author.trim())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t(T.addBook.errorDefault))
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t(T.addBook.title)}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>

          {/* 추천 도서 섹션 */}
          {grade && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-700">🎓 {t(T.addBook.recommended)}</span>
                <span className="text-xs text-gray-400">— {t(T.addBook.recommendedHint)}</span>
              </div>
              {loadingRec ? (
                <p className="text-xs text-gray-400 py-2">{t(T.addBook.loadingRecommended)}</p>
              ) : (
                <div className="overflow-y-auto max-h-44 pr-0.5 space-y-1.5">
                  {recommended.map((book) => {
                    const isSelected = title === book.title && author === book.author
                    return (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => handlePick(book)}
                        className={`w-full text-left rounded-xl border px-3 py-2 transition-all flex items-center justify-between gap-2
                          ${isSelected
                            ? 'bg-indigo-50 border-indigo-400 shadow-sm'
                            : 'bg-gray-50 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
                              {book.title}
                            </span>
                            {book.is_core && (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">
                                {lang === 'ko' ? '핵심' : 'Core'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate">{book.author}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${DIFFICULTY_COLOR[book.difficulty]}`}>
                            {DIFFICULTY_LABEL[book.difficulty][lang]}
                          </span>
                          {isSelected && <span className="text-indigo-500 text-sm">✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium">{t(T.addBook.orManual)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 shrink-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(T.addBook.bookTitle)}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(T.addBook.titlePlaceholder)}
                required
                autoFocus={!grade}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(T.addBook.author)}</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={t(T.addBook.authorPlaceholder)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            {loading && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-indigo-600 mb-1">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span className="font-medium text-sm">{t(T.addBook.generatingMaterials)}</span>
                </div>
                <p className="text-xs text-indigo-400">{t(T.addBook.generatingDesc)}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {t(T.common.cancel)}
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !author.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-3 rounded-xl transition-all active:scale-95"
              >
                {loading ? t(T.addBook.adding) : t(T.addBook.add)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
