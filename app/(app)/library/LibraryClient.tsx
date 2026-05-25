'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BookCard from '@/components/book/BookCard'
import AddBookModal from '@/components/book/AddBookModal'
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

  async function handleAddBook(title: string, author: string) {
    // 책 DB에 추가
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author }),
    })
    const book = await res.json()
    if (book.error) throw new Error(book.error)

    // Claude AI 학습 자료 생성 (백그라운드)
    await fetch('/api/ai/book-quest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, grade: profile.grade ?? 10, bookId: book.id }),
    })

    setBooks((prev) => [book, ...prev])
    router.push(`/library/${book.id}`)
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
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📚 책 라이브러리</h1>
          <p className="text-gray-500 text-sm mt-1">
            읽는 중 {reading}권 · 완독 {completed}권
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-sm"
        >
          <span>+</span> 새 책 추가
        </button>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: `전체 ${books.length}` },
          { key: 'reading', label: `읽는 중 ${reading}` },
          { key: 'completed', label: `완독 ${completed}` },
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

      {/* 책 목록 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📖</p>
          <p className="font-medium text-gray-600">아직 추가한 책이 없어요</p>
          <p className="text-sm mt-1">위의 "새 책 추가" 버튼을 눌러보세요!</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all"
          >
            첫 번째 책 추가하기
          </button>
        </div>
      )}

      {showModal && (
        <AddBookModal onClose={() => setShowModal(false)} onAdd={handleAddBook} />
      )}
    </div>
  )
}
