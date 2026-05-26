import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient, parseClaudeJSON } from '@/lib/claude'
import { GENERATE_RETRY_SYSTEM, GENERATE_RETRY_USER } from '@/lib/math/prompts'
import type { GeneratedMathProblem } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { problemText, errorLocation, topicTitle, grade, level } = await req.json()

    const client = getAnthropicClient()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20251022',
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

    return NextResponse.json({ retry_problems })
  } catch (err) {
    console.error('generate-retry error:', err)
    return NextResponse.json({ error: 'Failed to generate retry problems' }, { status: 500 })
  }
}
