import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient, parseClaudeJSON } from '@/lib/claude'
import { GENERATE_PROBLEMS_SYSTEM, GENERATE_PROBLEMS_USER } from '@/lib/math/prompts'
import type { GeneratedMathProblem, MathLevel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { sessionId, level, grade, topicTitle, conceptSummary } = await req.json()

    const client = getAnthropicClient()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: GENERATE_PROBLEMS_SYSTEM,
      messages: [
        {
          role: 'user',
          content: GENERATE_PROBLEMS_USER(grade, topicTitle, conceptSummary, level as MathLevel),
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const { problems } = parseClaudeJSON<{ problems: GeneratedMathProblem[] }>(raw)

    const rows = problems.map((p, i) => ({
      session_id: sessionId,
      student_id: profile.id,
      level: level as MathLevel,
      problem_number: i + 1,
      is_retry: false,
      problem_text: p.problem_text,
      correct_answer: p.correct_answer,
    }))

    const { data: inserted, error } = await supabase
      .from('math_problems')
      .insert(rows)
      .select()

    if (error) throw error

    return NextResponse.json({ problems: inserted })
  } catch (err) {
    console.error('generate-problems error:', err)
    return NextResponse.json({ error: 'Failed to generate problems' }, { status: 500 })
  }
}
