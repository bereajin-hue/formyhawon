'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Upload, Loader2, BookOpen, ChevronRight } from 'lucide-react'
import type { Profile, MathSession } from '@/types'
import type { Topic } from '@/lib/math/topics'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'

interface Props {
  profile: Profile
  dayNumber: number
  topic: Topic
  existingSession: MathSession | null
}

const AREA_COLORS: Record<string, string> = {
  number: 'bg-blue-100 text-blue-700',
  algebra: 'bg-purple-100 text-purple-700',
  geometry: 'bg-green-100 text-green-700',
  statistics: 'bg-orange-100 text-orange-700',
  sequences: 'bg-pink-100 text-pink-700',
  transformation: 'bg-teal-100 text-teal-700',
}

export default function MathSessionStart({ profile, dayNumber, topic, existingSession }: Props) {
  const router = useRouter()
  const { t, lang } = useT()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sessionId = existingSession?.id

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  async function getOrCreateSession(): Promise<string> {
    if (sessionId) return sessionId
    const res = await fetch('/api/math/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayNumber, topicTitle: topic.title }),
    })
    const data = await res.json()
    return data.session.id
  }

  async function handleAnalyze() {
    if (!imageFile) return
    setLoading(true)
    setError('')
    try {
      const sid = await getOrCreateSession()
      await fetch('/api/math/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, updates: { status: 'in_progress', started_at: new Date().toISOString() } }),
      })
      const base64 = await fileToBase64(imageFile)
      const res = await fetch('/api/math/extract-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, grade: profile.grade, topicTitle: topic.title, sessionId: sid }),
      })
      if (!res.ok) throw new Error(t(T.math.concept.generateError))
      router.push(`/math/session/${dayNumber}/concept`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t(T.math.concept.generateError))
    } finally {
      setLoading(false)
    }
  }

  async function handleSkipUpload() {
    setLoading(true)
    try {
      const sid = await getOrCreateSession()
      await fetch('/api/math/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, updates: { status: 'in_progress', started_at: new Date().toISOString() } }),
      })
      router.push(`/math/session/${dayNumber}/concept`)
    } finally {
      setLoading(false)
    }
  }

  if (existingSession?.status === 'completed') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {lang === 'ko' ? `Day ${dayNumber} 완료!` : `Day ${dayNumber} Complete!`}
        </h2>
        <p className="text-gray-500 mb-6">{topic.title}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          {t(T.math.backToDashboard)}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span>{t(T.math.mathQuest)}</span>
          <ChevronRight className="w-3 h-3" />
          <span>Day {dayNumber}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Day {dayNumber} — {topic.title}</h1>
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${AREA_COLORS[topic.area] ?? 'bg-gray-100 text-gray-600'}`}>
          {T.math.area[topic.area as keyof typeof T.math.area] ? t(T.math.area[topic.area as keyof typeof T.math.area]) : topic.area}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">{t(T.math.session.uploadTitle)}</h2>
            <p className="text-sm text-gray-500">{t(T.math.session.uploadDesc)}</p>
          </div>
        </div>

        {!preview ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Camera className="w-7 h-7 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700">{t(T.math.session.cameraPrompt)}</p>
              <p className="text-xs text-gray-400 mt-1">{t(T.math.session.cameraHint)}</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
          </div>
        ) : (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="preview" className="w-full rounded-xl object-contain max-h-80" />
            <button
              onClick={() => { setPreview(null); setImageFile(null) }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition"
            >✕</button>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleAnalyze}
            disabled={!preview || loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{t(T.math.session.analyzing)}</>
            ) : (
              <><Upload className="w-4 h-4" />{t(T.math.session.startAnalysis)}</>
            )}
          </button>
        </div>
      </div>

      <button
        onClick={handleSkipUpload}
        disabled={loading}
        className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition"
      >
        {t(T.math.session.skipUpload)}
      </button>
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
