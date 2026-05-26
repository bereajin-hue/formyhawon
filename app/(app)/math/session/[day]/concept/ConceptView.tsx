'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Lightbulb, AlertTriangle, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import type { MathConceptSummary, Profile } from '@/types'
import type { Topic } from '@/lib/math/topics'

interface Props {
  dayNumber: number
  topic: Topic
  summary: MathConceptSummary | null
  sessionId: string
  grade: number
  profile: Profile
}

export default function ConceptView({ dayNumber, topic, summary: initialSummary, sessionId, grade }: Props) {
  const router = useRouter()
  const [summary, setSummary] = useState<MathConceptSummary | null>(initialSummary)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  async function generateAIConcept() {
    setGenerating(true)
    setError('')
    try {
      const placeholderBase64 = btoa('placeholder')
      const res = await fetch('/api/math/extract-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: placeholderBase64,
          grade,
          topicTitle: topic.title,
          sessionId,
          noImage: true,
        }),
      })
      if (!res.ok) throw new Error('개념 생성에 실패했습니다.')
      const data = await res.json()
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span>Math Quest</span>
          <ChevronRight className="w-3 h-3" />
          <span>Day {dayNumber}</span>
          <ChevronRight className="w-3 h-3" />
          <span>개념 설명</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
      </div>

      {!summary ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-2">AI 개념 설명 생성</h2>
          <p className="text-sm text-gray-500 mb-5">AI가 {topic.title} 개념을 설명해 드립니다.</p>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          <button
            onClick={generateAIConcept}
            disabled={generating}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2 mx-auto"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'AI가 분석 중...' : '개념 설명 생성'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 개념명 + 공식 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{summary.concept_name}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">{summary.explanation}</p>
            {summary.formulas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">핵심 공식</p>
                {summary.formulas.map((f, i) => (
                  <div key={i} className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 font-mono text-sm text-indigo-800">
                    {f}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 예제 풀이 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900">예제 풀이</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-3">
              <p className="text-sm font-semibold text-gray-500 mb-1">문제</p>
              <p className="text-gray-800">{summary.worked_example.problem}</p>
            </div>
            <div className="space-y-2 mb-3">
              {summary.worked_example.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-green-600 mb-1">정답</p>
              <p className="font-semibold text-green-800">{summary.worked_example.answer}</p>
            </div>
          </div>

          {/* 주의사항 */}
          {summary.common_mistakes.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900">자주 하는 실수</h3>
              </div>
              <ul className="space-y-2">
                {summary.common_mistakes.map((m, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-amber-500 flex-shrink-0">⚠️</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => router.push(`/math/session/${dayNumber}/problems`)}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
        >
          문제 풀기 시작
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
