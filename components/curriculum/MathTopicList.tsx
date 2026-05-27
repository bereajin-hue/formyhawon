'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n/LanguageContext'

export interface MathTopic {
  id: string
  unit_number: number
  unit_name: string
  topic_number: number
  topic_name: string
  difficulty: string
  igcse_syllabus_ref: string
  key_skills: string[]
}

interface Props {
  grade: number
  onSelectTopic: (topic: MathTopic) => void
}

const DIFFICULTY_COLOR: Record<string, string> = {
  foundation: 'bg-green-100 text-green-700',
  core:       'bg-blue-100 text-blue-700',
  extended:   'bg-orange-100 text-orange-700',
}

const DIFFICULTY_LABEL: Record<string, { ko: string; en: string }> = {
  foundation: { ko: '기초', en: 'Foundation' },
  core:       { ko: '표준', en: 'Core' },
  extended:   { ko: '심화', en: 'Extended' },
}

export default function MathTopicList({ grade, onSelectTopic }: Props) {
  const { lang } = useT()
  const [grouped, setGrouped] = useState<Record<string, MathTopic[]>>({})
  const [loading, setLoading] = useState(true)
  const [openUnit, setOpenUnit] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/curriculum/math?grade=${grade}`)
      .then(r => r.json())
      .then(data => {
        setGrouped(data.grouped ?? {})
        const firstKey = Object.keys(data.grouped ?? {})[0]
        if (firstKey) setOpenUnit(firstKey)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [grade])

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400 text-sm">
        {lang === 'ko' ? '수학 커리큘럼을 불러오는 중...' : 'Loading math curriculum...'}
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">
        Grade {grade} IGCSE {lang === 'ko' ? '수학 (Cambridge 0580)' : 'Mathematics (Cambridge 0580)'}
      </p>
      <div className="space-y-2">
        {Object.entries(grouped).map(([unitName, topics]) => (
          <div key={unitName} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenUnit(openUnit === unitName ? null : unitName)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
              <span className="text-sm font-semibold text-gray-700">{unitName}</span>
              <span className="text-xs text-gray-400">
                {topics.length}{lang === 'ko' ? '개 토픽' : ' topics'} {openUnit === unitName ? '▲' : '▼'}
              </span>
            </button>

            {openUnit === unitName && (
              <div className="divide-y divide-gray-100">
                {topics.map(topic => {
                  const dc = DIFFICULTY_COLOR[topic.difficulty] ?? DIFFICULTY_COLOR.core
                  const dl = DIFFICULTY_LABEL[topic.difficulty] ?? DIFFICULTY_LABEL.core
                  return (
                    <button
                      key={topic.id}
                      onClick={() => onSelectTopic(topic)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-indigo-50 transition text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{topic.topic_name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                          {topic.key_skills.slice(0, 2).join(' · ')}
                          {topic.key_skills.length > 2 && ` +${topic.key_skills.length - 2}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${dc}`}>
                          {dl[lang]}
                        </span>
                        <span className="text-[10px] text-gray-400">{topic.igcse_syllabus_ref}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
