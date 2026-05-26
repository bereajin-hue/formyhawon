import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient, parseClaudeJSON } from '@/lib/claude'
import { GRADE_ANSWER_SYSTEM, GRADE_ANSWER_USER } from '@/lib/math/prompts'
import type { MathGradeResult } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { problemId, answerImageBase64, problemText, correctAnswer, grade } = await req.json()

    const client = getAnthropicClient()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      system: GRADE_ANSWER_SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: answerImageBase64,
              },
            },
            {
              type: 'text',
              text: GRADE_ANSWER_USER(problemText, correctAnswer, grade),
            },
          ],
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const result = parseClaudeJSON<MathGradeResult>(raw)

    await supabase
      .from('math_problems')
      .update({
        is_correct: result.is_correct,
        ai_feedback: result.feedback,
        ai_score: result.score,
      })
      .eq('id', problemId)

    if (!result.is_correct) {
      const { data: problem } = await supabase
        .from('math_problems').select('student_id').eq('id', problemId).single()

      if (problem) {
        const { data: existingRetries } = await supabase
          .from('math_review_queue')
          .select('id')
          .eq('problem_id', problemId)

        const retryCount = existingRetries?.length ?? 0
        const daysAhead = retryCount === 0 ? 1 : retryCount === 1 ? 3 : 7

        const scheduledDate = new Date()
        scheduledDate.setDate(scheduledDate.getDate() + daysAhead)

        await supabase.from('math_review_queue').insert({
          student_id: problem.student_id,
          problem_id: problemId,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
        })
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('grade-answer error:', err)
    return NextResponse.json({ error: 'Failed to grade answer' }, { status: 500 })
  }
}
