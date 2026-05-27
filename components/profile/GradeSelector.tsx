'use client'

import { useT } from '@/lib/i18n/LanguageContext'

interface Props {
  currentGrade?: number
  onGradeChange: (grade: number) => void
}

const GRADE_INFO: Record<number, { label: string; sub: { ko: string; en: string } }> = {
  8:  { label: 'Grade 8',  sub: { ko: 'MYP Year 3',            en: 'MYP Year 3' } },
  9:  { label: 'Grade 9',  sub: { ko: 'MYP Year 4 / IGCSE 입문', en: 'MYP Year 4 / Pre-IGCSE' } },
  10: { label: 'Grade 10', sub: { ko: 'IGCSE Year 1',           en: 'IGCSE Year 1' } },
  11: { label: 'Grade 11', sub: { ko: 'IGCSE Year 2 (시험반)',   en: 'IGCSE Year 2 (Exam Year)' } },
}

export default function GradeSelector({ currentGrade, onGradeChange }: Props) {
  const { lang } = useT()

  return (
    <div className="grid grid-cols-2 gap-2">
      {([8, 9, 10, 11] as const).map(grade => {
        const info = GRADE_INFO[grade]
        const isSelected = currentGrade === grade
        return (
          <button
            key={grade}
            onClick={() => onGradeChange(grade)}
            className={`px-4 py-3 rounded-xl border text-left transition-all
              ${isSelected
                ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-400'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
              }`}
          >
            <p className={`text-sm font-semibold ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
              {info.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{info.sub[lang]}</p>
          </button>
        )
      })}
    </div>
  )
}
