'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'

interface AddBookModalProps {
  onClose: () => void
  onAdd: (title: string, author: string) => Promise<void>
}

export default function AddBookModal({ onClose, onAdd }: AddBookModalProps) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t } = useT()

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">{t(T.addBook.title)}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(T.addBook.bookTitle)}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(T.addBook.titlePlaceholder)}
                required
                autoFocus
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
