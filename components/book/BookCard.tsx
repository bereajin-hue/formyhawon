'use client'

import Link from 'next/link'
import type { Book } from '@/types'

interface BookCardProps {
  book: Book
  onStatusChange?: (bookId: string, status: Book['status']) => void
}

const COVER_COLORS = [
  'from-indigo-400 to-indigo-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-orange-400 to-orange-600',
]

const STATUS_LABELS: Record<Book['status'], string> = {
  reading: '읽는 중',
  completed: '완독 ✓',
  wishlist: '읽고 싶어요',
}

const STATUS_COLORS: Record<Book['status'], string> = {
  reading: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600',
  wishlist: 'bg-yellow-100 text-yellow-600',
}

function getCoverColor(title: string) {
  const idx = title.charCodeAt(0) % COVER_COLORS.length
  return COVER_COLORS[idx]
}

export default function BookCard({ book, onStatusChange }: BookCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
      {/* 책 표지 */}
      <Link href={`/library/${book.id}`}>
        <div className={`h-36 bg-gradient-to-br ${getCoverColor(book.title)} flex items-end p-4 relative`}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />
          <div className="relative">
            <p className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow">
              {book.title}
            </p>
            <p className="text-white/80 text-xs mt-0.5">{book.author}</p>
          </div>
        </div>
      </Link>

      {/* 책 정보 */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[book.status]}`}>
            {STATUS_LABELS[book.status]}
          </span>
          {book.grade_level && (
            <span className="text-xs text-gray-400">{book.grade_level}학년</span>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            href={`/library/${book.id}`}
            className="flex-1 text-center text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-all active:scale-95 font-medium"
          >
            학습 자료 보기
          </Link>
          {book.status === 'reading' && onStatusChange && (
            <button
              onClick={() => onStatusChange(book.id, 'completed')}
              className="text-xs bg-green-50 hover:bg-green-100 text-green-600 px-3 py-2 rounded-lg transition-all border border-green-200"
              title="완독 표시"
            >
              ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
