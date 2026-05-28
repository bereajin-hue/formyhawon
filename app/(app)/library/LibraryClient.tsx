'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BookCard from '@/components/book/BookCard'
import AddBookModal from '@/components/book/AddBookModal'
import CurriculumBookList, { type CurriculumBook } from '@/components/curriculum/CurriculumBookList'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'
import type { Book, Profile } from '@/types'

interface Props {
  initialBooks: Book[]
  profile: Profile
}

export default function LibraryClient({ initialBooks, profile }: Props) {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'all' | Book['status']>('all')
  const [tab, setTab] = useState<'mybooks' | 'curriculum'>('mybooks')
  const [loadingTitle, setLoadingTitle] = useState<string | null>(null)
  const { t, lang } = useT()

  async function handleAddBook(title: string, author: string) {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author }),
    })
    const book = await res.json()
    if (book.error) throw new Error(book.error)

    await fetch('/api/ai/book-quest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, grade: profile.grade ?? 10, bookId: book.id }),
    })

    setBooks((prev) => [book, ...prev])
    router.push(`/library/${book.id}`)
  }

  async function handleSelectCurriculumBook(currBook: CurriculumBook) {
    setLoadingTitle(currBook.title)
    try {
      // 이미 내 책장에 있는지 확인
      const existing = books.find(b => b.title === currBook.title)
      if (existing) {
        router.push(`/library/${existing.id}`)
        return
      }

      // 새 책 추가
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: currBook.title, author: currBook.author }),
      })
      const book = await res.json()
      if (book.error) throw new Error(book.error)

      // AI 스터디 가이드 생성
      fetch('/api/ai/book-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: currBook.title, author: currBook.author, grade: profile.grade ?? 10 }),
      })

      setBooks((prev) => [book, ...prev])
      router.push(`/library/${book.id}`)
    } finally {
      setLoadingTitle(null)
    }
  }

  async function handleStatusChange(bookId: string, status: Book['status']) {
    await fetch('/api/books', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, status }),
    })
    setBooks((prev) => prev.map((b) => b.id === bookId ? { ...b, status } : b))
  }

  const filtered = filter === 'all' ? books : books.filter((b) => b.status === filter)
  const reading = books.filter((b) => b.status === 'reading').length
  const completed = books.filter((b) => b.status === 'completed').length

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t(T.library.title)}</h1>
          <p className="text-gray-500 text-sm mt-1">{T.library.stats(reading, completed, lang)}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-sm"
        >
          {t(T.library.addBook)}
        </button>
      </div>

      {/* 탭: 내 책장 / IGCSE 추천 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab('mybooks')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
            ${tab === 'mybooks' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          📚 {lang === 'ko' ? '내 책장' : 'My Books'}
        </button>
        <button
          onClick={() => setTab('curriculum')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
            ${tab === 'curriculum' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          🎓 {lang === 'ko' ? 'IGCSE 추천' : 'IGCSE List'}
        </button>
      </div>

      {tab === 'mybooks' ? (
        <>
          <div className="flex gap-2 mb-6">
            {[
              { key: 'all', label: T.library.filterAll(books.length, lang) },
              { key: 'reading', label: T.library.filterReading(reading, lang) },
              { key: 'completed', label: T.library.filterCompleted(completed, lang) },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                  ${filter === f.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((book) => (
                <BookCard key={book.id} book={book} onStatusChange={handleStatusChange} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📖</p>
              <p className="font-medium text-gray-600">{t(T.library.empty)}</p>
              <p className="text-sm mt-1">{t(T.library.emptyDesc)}</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all"
              >
                {t(T.library.addFirst)}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="max-w-xl">
          {loadingTitle && (
            <div className="mb-4 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-600">
              {lang === 'ko'
                ? `"${loadingTitle}" 스터디 가이드를 생성하는 중...`
                : `Creating study guide for "${loadingTitle}"...`}
            </div>
          )}
          <CurriculumBookList
            grade={profile.grade ?? 10}
            onSelectBook={handleSelectCurriculumBook}
          />
        </div>
      )}

      {showModal && (
        <AddBookModal onClose={() => setShowModal(false)} onAdd={handleAddBook} grade={profile.grade ?? 10} />
      )}
    </div>
  )
}
