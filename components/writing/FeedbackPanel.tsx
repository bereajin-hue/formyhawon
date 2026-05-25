'use client'

import type { EssayFeedback } from '@/types'

interface FeedbackPanelProps {
  feedback: EssayFeedback
  xpEarned: number
}

const SCORE_COLORS = ['', 'bg-red-100 text-red-600', 'bg-yellow-100 text-yellow-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600']
const SCORE_BAR = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400']

const CRITERIA_LABELS: Record<string, string> = {
  thesis_clarity: '📌 논제 명확성',
  evidence_quality: '📎 근거 품질',
  language_analysis: '🔍 언어 분석',
  coherence: '🔗 논리 흐름',
  contextual_awareness: '🌍 맥락 이해',
}

export default function FeedbackPanel({ feedback, xpEarned }: FeedbackPanelProps) {
  const scores = Object.values(feedback.scores).map((s) => s.score)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length

  return (
    <div className="space-y-4">
      {/* XP 획득 */}
      {xpEarned > 0 && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white text-center shadow-md">
          <p className="text-2xl font-bold">+{xpEarned} XP ✨</p>
          <p className="text-sm opacity-80 mt-0.5">에세이 제출 보상</p>
        </div>
      )}

      {/* 평균 점수 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">종합 점수</h3>
          <span className={`text-lg font-bold px-3 py-1 rounded-full ${SCORE_COLORS[Math.round(avg)]}`}>
            {avg.toFixed(1)} / 4.0
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${SCORE_BAR[Math.round(avg)]}`}
            style={{ width: `${(avg / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* 항목별 점수 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-bold text-gray-800">항목별 피드백</h3>
        {Object.entries(feedback.scores).map(([key, val]) => (
          <div key={key} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700">{CRITERIA_LABELS[key]}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SCORE_COLORS[val.score]}`}>
                {val.label}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full mb-2">
              <div className={`h-full rounded-full ${SCORE_BAR[val.score]}`} style={{ width: `${(val.score / 4) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{val.feedback}</p>
            <p className="text-xs text-indigo-600 mt-1.5 font-medium">💡 {val.tip}</p>
          </div>
        ))}
      </div>

      {/* 모범 문장 */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h3 className="font-bold text-amber-800 mb-2 text-sm">✍️ 개선 예시 문장</h3>
        <p className="text-sm text-amber-700 italic leading-relaxed">"{feedback.model_sentence}"</p>
      </div>

      {/* 전체 코멘트 */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <h3 className="font-bold text-indigo-800 mb-2 text-sm">💬 전체 코멘트</h3>
        <p className="text-sm text-indigo-700 leading-relaxed">{feedback.overall_comment}</p>
      </div>
    </div>
  )
}
