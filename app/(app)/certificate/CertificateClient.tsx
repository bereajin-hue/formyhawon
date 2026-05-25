'use client'

import { useRef } from 'react'
import { useT } from '@/lib/i18n/LanguageContext'
import { T } from '@/lib/i18n/translations'
import type { Profile, Milestone } from '@/types'

interface Props {
  profile: Profile
  startDate: string
  currentDay: number
  completedDays: number
  essayCount: number
  vocabCount: number
  approvedMilestones: Milestone[]
}

const MILESTONE_META: Record<number, { emoji: string }> = {
  10: { emoji: '🎀' },
  20: { emoji: '🏆' },
  30: { emoji: '🎁' },
}

export default function CertificateClient({
  profile,
  startDate,
  currentDay,
  completedDays,
  essayCount,
  vocabCount,
  approvedMilestones,
}: Props) {
  const certRef = useRef<HTMLDivElement>(null)
  const { t, lang } = useT()

  const isComplete = completedDays >= 25 || currentDay >= 30
  const completionRate = Math.round((completedDays / 30) * 100)

  const startFmt = new Date(startDate).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const today = new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const MILESTONE_LABEL: Record<number, string> = {
    10: t(T.parent.milestoneLabel[10]),
    20: t(T.parent.milestoneLabel[20]),
    30: t(T.parent.milestoneLabel[30]),
  }

  return (
    <div className="max-w-3xl">
      {/* 화면 전용 헤더 */}
      <div className="print:hidden mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t(T.certificate.title)}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isComplete
              ? t(T.certificate.complete)
              : T.certificate.inProgress(currentDay, lang)}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          {t(T.certificate.print)}
        </button>
      </div>

      {/* 수료증 본체 */}
      <div
        ref={certRef}
        className="certificate-card bg-white relative overflow-hidden"
        style={{
          border: '8px solid transparent',
          borderImage: 'linear-gradient(135deg, #6366f1, #a855f7, #6366f1) 1',
          padding: '48px 56px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          borderRadius: '0',
        }}
      >
        {/* 배경 장식 */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50 to-transparent rounded-full -translate-y-32 translate-x-32 opacity-60" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-50 to-transparent rounded-full translate-y-32 -translate-x-32 opacity-60" />
        </div>

        <div className="relative">
          {/* 상단 로고 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-2xl shadow-md mb-4">
              <span className="text-xl">📚</span>
              <span className="font-bold text-base tracking-wide">Scholar Quest</span>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">{t(T.certificate.certSubtitle)}</p>
          </div>

          {/* 타이틀 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-800 mb-1 tracking-tight">{t(T.certificate.certTitle)}</h2>
            <div className="flex items-center gap-2 justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-300" />
              <span className="text-indigo-400 text-sm">Certificate of Achievement</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-300" />
            </div>
          </div>

          {/* 이름 */}
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm mb-2">{t(T.certificate.subject)}</p>
            <p className="text-4xl font-black text-indigo-700 mb-2 tracking-tight">{profile.name}</p>
            {profile.grade && (
              <p className="text-gray-400 text-sm mb-4">({T.common.grade(profile.grade, lang)})</p>
            )}
            <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
              {T.certificate.body(lang)}
            </p>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: t(T.certificate.totalXp), value: profile.xp_total.toLocaleString(), unit: 'XP', color: 'indigo' },
              { label: t(T.certificate.completedDays), value: `${completedDays}`, unit: T.certificate.daysUnit(completedDays, lang), color: 'green' },
              { label: t(T.certificate.essays), value: `${essayCount}`, unit: T.certificate.essaysUnit(essayCount, lang), color: 'purple' },
              { label: t(T.certificate.vocabSessions), value: `${vocabCount}`, unit: lang === 'ko' ? '회' : 'sessions', color: 'orange' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
              >
                <p className={`text-2xl font-black ${
                  stat.color === 'indigo' ? 'text-indigo-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-orange-500'
                }`}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.unit}</p>
                <p className="text-xs font-medium text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* 완료율 바 */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{t(T.certificate.completionRate)}</span>
              <span className="font-semibold text-indigo-600">{completionRate}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* 승인된 마일스톤 */}
          {approvedMilestones.length > 0 && (
            <div className="mb-8">
              <p className="text-xs text-gray-500 text-center mb-3 uppercase tracking-widest">{t(T.certificate.milestones)}</p>
              <div className="flex justify-center gap-4">
                {approvedMilestones.map((m) => {
                  const meta = MILESTONE_META[m.day_number]
                  return (
                    <div key={m.id} className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-full flex items-center justify-center text-xl mb-1 mx-auto shadow-sm">
                        {meta?.emoji}
                      </div>
                      <p className="text-xs font-semibold text-gray-700">Day {m.day_number}</p>
                      <p className="text-xs text-gray-400">{MILESTONE_LABEL[m.day_number]}</p>
                      {m.reward_description && (
                        <p className="text-xs text-amber-600 mt-0.5 italic">"{m.reward_description}"</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 날짜 + 서명 */}
          <div className="flex items-end justify-between pt-6 border-t border-gray-100">
            <div className="text-xs text-gray-400 space-y-0.5">
              <p>{t(T.certificate.startDate)} <span className="text-gray-600 font-medium">{startFmt}</span></p>
              <p>{t(T.certificate.issueDate)} <span className="text-gray-600 font-medium">{today}</span></p>
            </div>
            <div className="text-center">
              <div className="w-24 border-b border-gray-300 mb-1" />
              <p className="text-xs text-gray-400">{t(T.certificate.signature)}</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5">
                <span className="text-indigo-500">✓</span>
                <span className="text-xs font-semibold text-indigo-700">Scholar Quest</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isComplete && (
        <div className="print:hidden mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
          <p className="font-semibold mb-1">{t(T.certificate.inProgressNote)}</p>
          <p className="text-indigo-500 text-xs">{T.certificate.inProgressDesc(completedDays, lang)}</p>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .certificate-card, .certificate-card * { visibility: visible !important; }
          .certificate-card {
            position: fixed !important;
            top: 20mm !important;
            left: 15mm !important;
            right: 15mm !important;
            width: auto !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
