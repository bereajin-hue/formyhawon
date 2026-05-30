'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, ChevronRight, CheckCircle, XCircle, RefreshCw, Trophy, PenLine } from 'lucide-react'
import type { Profile, MathProblem, MathSession, MathGradeResult, MathLevel } from '@/types'
import type { Topic } from '@/lib/math/topics'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'

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
  const { t, lang } = useT()
  const fileRef = useRef<HTMLInputElement>(null)

  const [currentLevel, setCurrentLevel] = useState<MathLevel>(() => {
    for (const level of LEVELS) {
      const levelPs = existingProblems.filter(p => p.level === level && !p.is_retry)
      const allGraded = levelPs.length > 0 && levelPs.every(p => p.is_correct !== null)
      const correct = levelPs.filter(p => p.is_correct === true).length
      if (!allGraded || correct < MASTERY_THRESHOLD[level]) return level
    }
    return 'synthesis'
  })
  const [problems, setProblems] = useState<MathProblem[]>(existingProblems)
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0)
  const [answerMode, setAnswerMode] = useState<'text' | 'image'>('text')
  const [textAnswer, setTextAnswer] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [grading, setGrading] = useState(false)
  const [gradeResult, setGradeResult] = useState<MathGradeResult | null>(null)
  const [generating, setGenerating] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(session.status === 'completed')
  const [xpEarned, setXpEarned] = useState(session.xp_earned)
  const [error, setError] = useState('')

  const levelProblems = problems.filter(p => p.level === currentLevel && !p.is_retry)

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
      // concept_summary의 concept_name이 현재 topicTitle과 일치할 때만 사용 — 불일치시 오염 방지
      const summary = session.concept_summary as { concept_name?: string } | null
      const conceptMatchesTopic = summary?.concept_name
        ? topic.title.toLowerCase().includes(summary.concept_name.toLowerCase().split(' ')[0] ?? '')
          || summary.concept_name.toLowerCase().includes(topic.title.toLowerCase().split(' ')[0] ?? '')
        : false
      const conceptSummary = (summary && conceptMatchesTopic) ? JSON.stringify(summary) : topic.title
      const res = await fetch('/api/math/generate-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, level, grade: profile.grade, topicTitle: topic.title, conceptSummary }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProblems(prev => [...prev, ...data.problems])
      setCurrentProblemIdx(0)
      setGradeResult(null)
      setTextAnswer('')
      setPreview(null)
      setImageFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
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
    if (!currentProblem) return
    if (answerMode === 'text' && !textAnswer.trim()) return
    if (answerMode === 'image' && !imageFile) return
    setGrading(true)
    setError('')
    try {
      let body: Record<string, unknown> = {
        problemId: currentProblem.id,
        problemText: currentProblem.problem_text,
        correctAnswer: currentProblem.correct_answer,
        grade: profile.grade,
      }
      if (answerMode === 'text') {
        body.textAnswer = textAnswer.trim()
      } else {
        const base64 = await fileToBase64(imageFile!)
        body.answerImageBase64 = base64
        body.imageMediaType = imageFile!.type || 'image/jpeg'
      }
      const res = await fetch('/api/math/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result: MathGradeResult = await res.json()
      if (!res.ok) throw new Error('채점 실패')
      setGradeResult(result)
      setProblems(prev => prev.map(p => p.id === currentProblem.id ? { ...p, is_correct: result.is_correct, ai_feedback: result.feedback, ai_score: result.score } : p))
      if (result.is_correct) setXpEarned(prev => prev + XP_PER_CORRECT[currentLevel])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setGrading(false)
    }
  }

  async function handleNextProblem() {
    const updatedLevelProblems = problems.filter(p => p.level === currentLevel && !p.is_retry)
    if (currentProblemIdx < updatedLevelProblems.length - 1) {
      setCurrentProblemIdx(prev => prev + 1)
      setGradeResult(null)
      setTextAnswer('')
      setPreview(null)
      setImageFile(null)
    } else {
      await checkMasteryGate()
    }
  }

  async function checkMasteryGate() {
    const updatedProblems = problems.filter(p => p.level === currentLevel && !p.is_retry)
    const correct = updatedProblems.filter(p => p.is_correct === true).length
    if (currentLevel === 'synthesis') { await completeSession(); return }
    if (correct >= MASTERY_THRESHOLD[currentLevel]) {
      const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1]
      setCurrentLevel(nextLevel)
      setCurrentProblemIdx(0)
      setGradeResult(null)
      setTextAnswer('')
      setPreview(null)
      setImageFile(null)
    } else {
      await generateRetryProblems()
    }
  }

  async function generateRetryProblems() {
    const wrongProblems = problems.filter(p => p.level === currentLevel && p.is_correct === false && !p.is_retry)
    const firstWrong = wrongProblems[0]
    // 틀린 문제가 없으면(0/0 케이스) 일반 문제 새로 생성
    if (!firstWrong) {
      await generateProblems(currentLevel)
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/math/generate-retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          problemText: firstWrong.problem_text,
          errorLocation: firstWrong.ai_feedback ?? null,
          topicTitle: topic.title,
          grade: profile.grade,
          level: currentLevel,
        }),
      })
      const data = await res.json()
      if (data.problems?.length > 0) {
        setProblems(prev => [...prev, ...data.problems])
        setCurrentProblemIdx(0)
        setGradeResult(null)
        setTextAnswer('')
        setPreview(null)
        setImageFile(null)
      }
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
      body: JSON.stringify({ sessionId: session.id, updates: { status: 'completed', completed_at: new Date().toISOString(), xp_earned: finalXp } }),
    })
    await fetch('/api/math/daily-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: profile.name, grade: profile.grade, topicTitle: topic.title, correct: totalCorrect, total: allProblems.length, minutes: Math.round((Date.now() - new Date(session.started_at ?? Date.now()).getTime()) / 60000), weakAreas: [], studentId: profile.id, dayNumber }),
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{T.math.problems.dayComplete(dayNumber, lang)}</h1>
        <p className="text-gray-500 mb-4">{topic.title}</p>
        <div className="bg-indigo-50 rounded-2xl px-6 py-4 mb-8 inline-block">
          <p className="text-sm text-indigo-600 font-medium">{t(T.math.xpEarned)}</p>
          <p className="text-4xl font-bold text-indigo-700">+{xpEarned}</p>
        </div>
        <button onClick={() => router.push('/dashboard')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition">
          {t(T.math.backToDashboard)}
        </button>
      </div>
    )
  }

  if (generating && levelProblems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-gray-600 font-medium">{T.math.problems.generatingProblems(LEVEL_LABELS[currentLevel], lang)}</p>
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
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-indigo-600 text-white shadow-sm' : isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {isDone ? '✓ ' : ''}{LEVEL_LABELS[level]}
              </div>
              {idx < LEVELS.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
            </div>
          )
        })}
      </div>

      {currentProblem && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm text-gray-500 whitespace-nowrap">
              {T.math.problems.problemOf(currentProblemIdx + 1, levelProblems.length, lang)}
            </p>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((currentProblemIdx + 1) / levelProblems.length) * 100}%` }} />
            </div>
            <span className="text-xs text-indigo-600 font-semibold">+{XP_PER_CORRECT[currentLevel]} XP</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <p className="text-lg font-semibold text-gray-900 leading-relaxed mb-4">{currentProblem.problem_text}</p>

            {gradeResult === null && (
              <div>
                {/* 모드 전환 탭 */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => { setAnswerMode('text'); setPreview(null); setImageFile(null) }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all
                      ${answerMode === 'text' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <PenLine className="w-4 h-4" />
                    {t(T.math.problems.modeText)}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAnswerMode('image'); setTextAnswer('') }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all
                      ${answerMode === 'image' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Camera className="w-4 h-4" />
                    {t(T.math.problems.modePhoto)}
                  </button>
                </div>

                {/* 텍스트 입력 모드 */}
                {answerMode === 'text' && (
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder={t(T.math.problems.textPlaceholder)}
                    rows={5}
                    className="w-full text-gray-800 text-sm border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none placeholder-gray-300"
                  />
                )}

                {/* 사진 업로드 모드 */}
                {answerMode === 'image' && (
                  !preview ? (
                    <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition">
                      <Camera className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-500">{t(T.math.problems.uploadAnswer)}</p>
                      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
                    </div>
                  ) : (
                    <div className="relative mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="answer" className="w-full rounded-xl max-h-60 object-contain" />
                      <button onClick={() => { setPreview(null); setImageFile(null) }} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white text-xs hover:bg-black/70">✕</button>
                    </div>
                  )
                )}

                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

                {/* 제출 버튼 — 둘 중 하나라도 입력되면 활성화 */}
                {(textAnswer.trim() || preview) && (
                  <button onClick={handleGrade} disabled={grading} className="w-full mt-3 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                    {grading ? <><Loader2 className="w-4 h-4 animate-spin" />{t(T.math.problems.grading)}</> : t(T.math.problems.submit)}
                  </button>
                )}
              </div>
            )}

            {gradeResult && (
              <div className={`rounded-xl p-4 ${gradeResult.is_correct ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {gradeResult.is_correct ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                  <p className="font-bold text-gray-900">{gradeResult.is_correct ? t(T.math.problems.correct) : t(T.math.problems.wrong)}</p>
                  <span className={`ml-auto text-sm font-semibold ${gradeResult.is_correct ? 'text-green-600' : 'text-red-500'}`}>{gradeResult.score}{lang === 'ko' ? '점' : 'pts'}</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{gradeResult.feedback}</p>
                {!gradeResult.is_correct && gradeResult.error_location && (
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-red-500 mb-1">{t(T.math.problems.errorLocation)}</p>
                    <p className="text-sm text-gray-700">{gradeResult.error_location}</p>
                  </div>
                )}
                {!gradeResult.is_correct && gradeResult.correct_working && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs font-semibold text-indigo-500 mb-1">{t(T.math.problems.correctWorking)}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{gradeResult.correct_working}</p>
                  </div>
                )}
                <button onClick={handleNextProblem} className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">
                  {currentProblemIdx < levelProblems.length - 1 ? t(T.math.problems.nextProblem) : t(T.math.problems.checkResult)}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Mastery Gate 실패 — 문제가 실제로 있고 모두 채점된 경우에만 */}
      {levelProblems.length > 0 &&
        levelProblems.every(p => p.is_correct !== null) &&
        levelProblems.filter(p => p.is_correct === true).length < MASTERY_THRESHOLD[currentLevel] && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-bold text-gray-900">{t(T.math.problems.retryTitle)}</p>
              <p className="text-sm text-gray-500">
                {levelProblems.filter(p => p.is_correct).length}/{levelProblems.length} — {lang === 'ko' ? '통과 기준' : 'Pass'}: {MASTERY_THRESHOLD[currentLevel]}/{levelProblems.length}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">{t(T.math.problems.retryDesc)}</p>
          <button
            onClick={generateRetryProblems}
            disabled={generating}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" />{lang === 'ko' ? '문제 생성 중...' : 'Generating...'}</> : t(T.math.problems.retryBtn)}
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
