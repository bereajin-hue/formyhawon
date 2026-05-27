'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n/LanguageContext'

export interface CurriculumBook {
  id: string
  title: string
  author: string
  difficulty: 'accessible' | 'standard' | 'challenging'
  is_core: boolean
  themes: string[]
  essay_themes: string[]
  description: string
}

interface Props {
  grade: number
  onSelectBook: (book: CurriculumBook) => void
}

const DIFFICULTY_LABEL = {
  accessible: { ko: '입문', en: 'Accessible' },
  standard:   { ko: '표준', en: 'Standard' },
  challenging:{ ko: '심화', en: 'Advanced' },
}

const DIFFICULTY_COLOR = {
  accessible: 'bg-green-100 text-green-700',
  standard:   'bg-blue-100 text-blue-700',
  challenging:'bg-orange-100 text-orange-700',
}

export default function CurriculumBookList({ grade, onSelectBook }: Props) {
  const { lang } = useT()
  const [books, setBooks] = useState<CurriculumBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/curriculum/books?grade=${grade}`)
      .then(r => r.json())
      .then(data => {
        setBooks(data.books ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [grade])

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400 text-sm">
        {lang === 'ko' ? '추천 도서를 불러오는 중...' : 'Loading recommended books...'}
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400 text-sm">
        {lang === 'ko' ? `Grade ${grade} 추천 도서가 없습니다` : `No recommended books for Grade ${grade}`}
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">
        Grade {grade} IGCSE {lang === 'ko' ? '추천 도서' : 'Recommended Reading'} {books.length}{lang === 'ko' ? '권' : ' books'}
      </p>
      <div className="grid gap-3">
        {books.map(book => (
          <button
            key={book.id}
            onClick={() => onSelectBook(book)}
            className="w-full text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all bg-white"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-medium text-gray-900 text-sm truncate">{book.title}</span>
                {book.is_core && (
                  <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                    {lang === 'ko' ? '핵심' : 'Core'}
                  </span>
                )}
              </div>
              <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[book.difficulty]}`}>
                {DIFFICULTY_LABEL[book.difficulty][lang]}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{book.author}</p>
            <div className="flex flex-wrap gap-1">
              {book.themes.slice(0, 3).map(theme => (
                <span key={theme} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {theme}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
