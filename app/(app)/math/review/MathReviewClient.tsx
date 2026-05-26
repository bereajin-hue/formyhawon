'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2, CheckCircle, XCircle, BookCheck } from 'lucide-react'
import type { Profile, MathReviewItem, MathGradeResult } from '@/types'

interface Props {
  profile: Profile
  reviewItems: (MathReviewItem & { problem: { problem_text: string; correct_answer: string; level: string; session_id: string } | null })[]
}

export default function MathReviewClient({ profile, reviewItems: initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [grading, setGrading] = useState(false)
  const [gradeResult, setGradeResult] = useState<MathGradeResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setGradeResult(null)
  }

  async function handleGrade(item: (typeof items)[0]) {
    if (!imageFile || !item.problem) return
    setGrading(true)
    try {
      const base64 = await fileToBase64(imageFile)
      const res = await fetch('/api/math/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: item.problem_id,
          answerImageBase64: base64,
          problemText: item.problem.problem_text,
          correctAnswer: item.problem.correct_answer,
          grade: profile.grade,
        }),
      })
      const result: MathGradeResult = await res.json()
      setGradeResult(result)

      if (result.is_correct) {
        await fetch(`/api/math/review/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: true }),
        })
        setItems(prev => prev.filter(i => i.id !== item.id))
        setActiveIdx(null)
        setPreview(null)
        setImageFile(null)
      }
    } finally {
      setGrading(false)
    }
  }

  async function markComplete(itemId: string) {
    await fetch(`/api/math/review/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })
    setItems(prev => prev.filter(i => i.id !== itemId))
    setActiveIdx(null)
    setGradeResult(null)
    setPreview(null)
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookCheck className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">오늘 복습 없음!</h2>
        <p className="text-gray-500">오늘은 복습 없이 새 개념을 배울 차례예요!</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">수학 복습 큐</h1>
        <p className="text-gray-500 mt-1">오늘 복습할 문제 {items.length}개</p>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {item.problem?.level?.toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">복습 예정: {item.scheduled_date}</p>
                </div>
              </div>
              <p className="text-gray-800 font-medium">{item.problem?.problem_text}</p>

              <button
                onClick={() => {
                  if (activeIdx === idx) {
                    setActiveIdx(null)
                  } else {
                    setActiveIdx(idx)
                    setPreview(null)
                    setImageFile(null)
                    setGradeResult(null)
                  }
                }}
                className="mt-3 text-sm text-indigo-600 font-medium hover:underline"
              >
                {activeIdx === idx ? '접기 ▲' : '복습 풀기 ▼'}
              </button>
            </div>

            {activeIdx === idx && (
              <div className="border-t border-gray-100 p-5">
                {!gradeResult ? (
                  <>
                    {!preview ? (
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-indigo-300 transition"
                      >
                        <Camera className="w-6 h-6 text-gray-400" />
                        <p className="text-sm text-gray-500">풀이 사진 업로드</p>
                        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
                      </div>
                    ) : (
                      <div className="relative mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="답안" className="w-full rounded-xl max-h-48 object-contain" />
                        <button onClick={() => { setPreview(null); setImageFile(null) }} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full text-white text-xs hover:bg-black/70">✕</button>
                      </div>
                    )}
                    {preview && (
                      <button
                        onClick={() => handleGrade(item)}
                        disabled={grading}
                        className="w-full mt-3 py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 transition flex items-center justify-center gap-2"
                      >
                        {grading ? <><Loader2 className="w-4 h-4 animate-spin" />채점 중...</> : '제출'}
                      </button>
                    )}
                  </>
                ) : (
                  <div className={`rounded-xl p-4 ${gradeResult.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {gradeResult.is_correct
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <XCircle className="w-5 h-5 text-red-500" />
                      }
                      <p className="font-semibold">{gradeResult.is_correct ? '정답! 복습 완료 🎉' : '아쉬워요...'}</p>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{gradeResult.feedback}</p>
                    {!gradeResult.is_correct && (
                      <button
                        onClick={() => markComplete(item.id)}
                        className="w-full py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300 transition"
                      >
                        이해했어요 — 완료 처리
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
