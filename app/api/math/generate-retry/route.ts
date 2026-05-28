import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient, parseClaudeJSON } from '@/lib/claude'
import { GENERATE_RETRY_SYSTEM, GENERATE_RETRY_USER } from '@/lib/math/prompts'
import type { GeneratedMathProblem, MathLevel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { sessionId, problemText, errorLocation, topicTitle, grade, level } = await req.json()

    const client = getAnthropicClient()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: GENERATE_RETRY_SYSTEM,
      messages: [
        {
          role: 'user',
          content: GENERATE_RETRY_USER(problemText, errorLocation ?? '알 수 없는 오류', topicTitle, grade, level),
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const { retry_problems } = parseClaudeJSON<{ retry_problems: GeneratedMathProblem[] }>(raw)

    // DB에 저장
    const rows = retry_problems.map((p, i) => ({
      session_id: sessionId,
      student_id: profile.id,
      level: level as MathLevel,
      problem_number: i + 1,
      is_retry: true,
      problem_text: p.problem_text,
      correct_answer: p.correct_answer,
    }))

    const { data: inserted, error } = await supabase
      .from('math_problems').insert(rows).select()

    if (error) throw error

    return NextResponse.json({ problems: inserted })
  } catch (err) {
    console.error('generate-retry error:', err)
    return NextResponse.json({ error: 'Failed to generate retry problems' }, { status: 500 })
  }
}
