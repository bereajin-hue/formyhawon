import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient, parseClaudeJSON } from '@/lib/claude'
import { EXTRACT_CONCEPT_SYSTEM, EXTRACT_CONCEPT_USER } from '@/lib/math/prompts'
import type { MathConceptSummary } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { imageBase64, grade, topicTitle, sessionId, noImage } = await req.json()

    const client = getAnthropicClient()

    const userContent = noImage
      ? EXTRACT_CONCEPT_USER(grade, topicTitle)
      : [
          {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: 'image/jpeg' as const,
              data: imageBase64,
            },
          },
          {
            type: 'text' as const,
            text: EXTRACT_CONCEPT_USER(grade, topicTitle),
          },
        ]

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20251022',
      max_tokens: 1500,
      system: EXTRACT_CONCEPT_SYSTEM(grade),
      messages: [{ role: 'user', content: userContent }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const summary = parseClaudeJSON<MathConceptSummary>(raw)

    await supabase
      .from('math_sessions')
      .update({ concept_summary: summary })
      .eq('id', sessionId)

    return NextResponse.json(summary)
  } catch (err) {
    console.error('extract-concept error:', err)
    return NextResponse.json({ error: 'Failed to extract concept' }, { status: 500 })
  }
}
