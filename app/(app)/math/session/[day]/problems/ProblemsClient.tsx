'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, ChevronRight, Lightbulb, CheckCircle, XCircle, RefreshCw, Trophy } from 'lucide-react'
import type { Profile, MathProblem, MathSession, MathGradeResult, MathLevel } from '@/types'
import type { Topic } from '@/lib/math/topics'

interface Props {
  profile: Profile
  dayNumber: number
  topic: Topic
  session: MathSession
  existingProblems: MathProblem[]
}

const LEVELS: MathLevel[] = ['easy', 'medium', 'hard', 'synthesis']
const LEVEL_LABELS: Record<MathLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  synthesis: 'Synthesis',
}
const MASTERY_THRESHOLD: Record<MathLevel, number> = {
  easy: 4,
  medium: 3,
  hard: 2,
  synthesis: 0,
}
const XP_PER_CORRECT: Record<MathLevel, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
  synthesis: 30,
}

export default function ProblemsClient({ profile, dayNumber, topic, session, existingProblems }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [currentLevel, setCurrentLevel] = useState<MathLevel>(() => {
    const completedLevels = new Set(existingProblems.filter(p => p.is_correct !== null && !p.is_retry).map(p => p.level))
    for (const level of LEVELS) {
      if (!completedLevels.has(level)) return level
    }
    return 'synthesis'
  })
  const [problems, setProblems] = useState<(MathProblem & { hint?: string })[]>(existingProblems)
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0)
  const [hints, setHints] = useState<Record<string, string>>({})
  const [showHint, setShowHint] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [grading, setGrading] = useState(false)
  const [gradeResult, setGradeResult] = useState<MathGradeResult | null>(null)
  const [retryProblems, setRetryProblems] = useState<{ problem_text: string; correct_answer: string; hint: string }[]>([])
  const [generating, setGenerating] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(session.status === 'completed')
  const [xpEarned, setXpEarned] = useState(session.xp_earned)
  const [error, setError] = useState('')

  const levelProblems = problems.filter(p => p.level === currentLevel && !p.is_retry)
  const allAnswered = levelProblems.every(p => p.is_correct !== null)
  const correctCount = levelProblems.filter(p => p.is_correct === true).length

  useEffect(() => {
    if (levelProblems.length === 0 && !generating) {
      generateProblems(currentLevel)
    }
  }, [currentLevel]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentProblem = levelProblems[currentProblemIdx] ?? null

  async function generateProblems(level: MathLevel) {
    setGenerating(true)
    setError('')
    try {
      const conceptSummary = session.concept_summary
        ? JSON.stringify(session.concept_summary)
        : topic.title

      const res = await fetch('/api/math/generate-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          level,
          grade: profile.grade,
          topicTitle: topic.title,
          conceptSummary,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setProblems(prev => [...prev, ...data.problems])
      const hintMap: Record<string, string> = {}
      data.problems.forEach((p: MathProblem, i: number) => {
        hintMap[p.id] = data.hints[i] ?? ''
      })
      setHints(prev => ({ ...prev, ...hintMap }))
      setCurrentProblemIdx(0)
      setGradeResult(null)
      setPreview(null)
      setImageFile(null)
      setShowHint(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '문제 생성 오류')
    } finally {
      setGenerating(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setGradeResult(null)
  }

  async function handleGrade() {
    if (!imageFile || !currentProblem) return
    setGrading(true)
    setError('')
    try {
      const base64 = await fileToBase64(imageFile)
      const res = await fetch('/api/math/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: currentProblem.id,
          answerImageBase64: base64,
          problemText: currentProblem.problem_text,
          correctAnswer: currentProblem.correct_answer,
          grade: profile.grade,
        }),
      })
      const result: MathGradeResult = await res.json()
      if (!res.ok) throw new Error('채점 실패')

      setGradeResult(result)
      setProblems(prev => prev.map(p =>
        p.id === currentProblem.id
          ? { ...p, is_correct: result.is_correct, ai_feedback: result.feedback, ai_score: result.score }
          : p
      ))

      if (result.is_correct) {
        setXpEarned(prev => prev + XP_PER_CORRECT[currentLevel])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '채점 중 오류')
    } finally {
      setGrading(false)
    }
  }

  async function handleNextProblem() {
    const updatedLevelProblems = problems.filter(p => p.level === currentLevel && !p.is_retry)
    if (currentProblemIdx < updatedLevelProblems.length - 1) {
      setCurrentProblemIdx(prev => prev + 1)
      setGradeResult(null)
      setPreview(null)
      setImageFile(null)
      setShowHint(false)
    } else {
      await checkMasteryGate()
    }
  }

  async function checkMasteryGate() {
    const updatedProblems = problems.filter(p => p.level === currentLevel && !p.is_retry)
    const correct = updatedProblems.filter(p => p.is_correct === true).length
    const threshold = MASTERY_THRESHOLD[currentLevel]

    if (currentLevel === 'synthesis') {
      await completeSession()
      return
    }

    if (correct >= threshold) {
      const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1]
      setCurrentLevel(nextLevel)
      setCurrentProblemIdx(0)
      setGradeResult(null)
      setPreview(null)
      setImageFile(null)
    } else {
      await generateRetryProblems()
    }
  }

  async function generateRetryProblems() {
    const wrongProblems = problems.filter(p => p.level === currentLevel && p.is_correct === false && !p.is_retry)
    const firstWrong = wrongProblems[0]
    if (!firstWrong) return

    setGenerating(true)
    try {
      const res = await fetch('/api/math/generate-retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: firstWrong.problem_text,
          errorLocation: firstWrong.ai_feedback ?? null,
          topicTitle: topic.title,
          grade: profile.grade,
          level: currentLevel,
        }),
      })
      const data = await res.json()
      setRetryProblems(data.retry_problems ?? [])
    } finally {
      setGenerating(false)
    }
  }

  async function completeSession() {
    const allProblems = problems.filter(p => !p.is_retry)
    const totalCorrect = allProblems.filter(p => p.is_correct).length
    const finalXp = xpEarned + 50

    await fetch('/api/math/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        updates: {
          status: 'completed',
          completed_at: new Date().toISOString(),
          xp_earned: finalXp,
        },
      }),
    })

    await fetch('/api/math/daily-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: profile.name,
        grade: profile.grade,
        topicTitle: topic.title,
        correct: totalCorrect,
        total: allProblems.length,
        minutes: Math.round((Date.now() - new Date(session.started_at ?? Date.now()).getTime()) / 60000),
        weakAreas: [],
        studentId: profile.id,
        dayNumber,
      }),
    })

    setXpEarned(finalXp)
    setSessionComplete(true)
  }

  if (sessionComplete) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Day {dayNumber} 완료!</h1>
        <p className="text-gray-500 mb-4">{topic.title}</p>
        <div className="bg-indigo-50 rounded-2xl px-6 py-4 mb-8 inline-block">
          <p className="text-sm text-indigo-600 font-medium">획득 XP</p>
          <p className="text-4xl font-bold text-indigo-700">+{xpEarned}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition"
        >
          대시보드로 돌아가기
        </button>
      </div>
    )
  }

  if (generating && levelProblems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-gray-600 font-medium">AI가 {LEVEL_LABELS[currentLevel]} 문제를 생성 중...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 레벨 진행 표시 */}
      <div className="flex items-center gap-2 mb-6">
        {LEVELS.map((level, idx) => {
          const isDone = LEVELS.indexOf(currentLevel) > idx
          const isActive = level === currentLevel
          return (
            <div key={level} className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive ? 'bg-indigo-600 text-white shadow-sm' :
                isDone ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? '✓ ' : ''}{LEVEL_LABELS[level]}
              </div>
              {idx < LEVELS.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
            </div>
          )
        })}
      </div>

      {/* 현재 문제 */}
      {currentProblem && (
        <>
          {/* 진행 바 */}
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm text-gray-500 whitespace-nowrap">문제 {currentProblemIdx + 1} / {levelProblems.length}</p>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${((currentProblemIdx + 1) / levelProblems.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-indigo-600 font-semibold">+{XP_PER_CORRECT[currentLevel]} XP</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <p className="text-lg font-semibold text-gray-900 leading-relaxed mb-4">
              {currentProblem.problem_text}
            </p>

            {/* 힌트 */}
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 mb-4"
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? '힌트 숨기기' : '힌트 보기'}
            </button>
            {showHint && hints[currentProblem.id] && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800">
                {hints[currentProblem.id]}
              </div>
            )}

            {/* 답안 업로드 */}
            {gradeResult === null && (
              <div>
                {!preview ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition"
                  >
                    <Camera className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-500">풀이 사진 촬영 또는 업로드</p>
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
                  </div>
                ) : (
                  <div className="relative mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="답안 미리보기" className="w-full rounded-xl max-h-60 object-contain" />
                    <button
                      onClick={() => { setPreview(null); setImageFile(null) }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white text-xs hover:bg-black/70"
                    >✕</button>
                  </div>
                )}
                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                {preview && (
                  <button
                    onClick={handleGrade}
                    disabled={grading}
                    className="w-full mt-3 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {grading ? <><Loader2 className="w-4 h-4 animate-spin" />채점 중...</> : '제출하기'}
                  </button>
                )}
              </div>
            )}

            {/* 채점 결과 */}
            {gradeResult && (
              <div className={`rounded-xl p-4 ${gradeResult.is_correct ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {gradeResult.is_correct
                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                    : <XCircle className="w-5 h-5 text-red-500" />
                  }
                  <p className="font-bold text-gray-900">{gradeResult.is_correct ? '정답입니다! 🎉' : '아쉬워요 😢'}</p>
                  <span className={`ml-auto text-sm font-semibold ${gradeResult.is_correct ? 'text-green-600' : 'text-red-500'}`}>
                    {gradeResult.score}점
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{gradeResult.feedback}</p>
                {!gradeResult.is_correct && gradeResult.error_location && (
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-red-500 mb-1">오류 위치</p>
                    <p className="text-sm text-gray-700">{gradeResult.error_location}</p>
                  </div>
                )}
                {!gradeResult.is_correct && gradeResult.correct_working && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs font-semibold text-indigo-500 mb-1">올바른 풀이</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{gradeResult.correct_working}</p>
                  </div>
                )}
                <button
                  onClick={handleNextProblem}
                  className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                  {currentProblemIdx < levelProblems.length - 1 ? '다음 문제' : '결과 확인'}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Mastery Gate 실패 - 유사문제 */}
      {allAnswered && correctCount < MASTERY_THRESHOLD[currentLevel] && retryProblems.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-bold text-gray-900">조금 더 연습해봐요!</p>
              <p className="text-sm text-gray-500">{correctCount}/{levelProblems.length} 정답 — 통과 기준: {MASTERY_THRESHOLD[currentLevel]}/5</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">비슷한 문제 3개를 더 풀어봅시다.</p>
          <button
            onClick={() => {
              router.push(`/math/session/${dayNumber}/problems`)
            }}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
          >
            유사문제 풀기
          </button>
        </div>
      )}
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
