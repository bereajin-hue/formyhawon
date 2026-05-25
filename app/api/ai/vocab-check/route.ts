import { getAnthropicClient, parseClaudeJSON } from '@/lib/claude'
import { VOCAB_CHECK_SYSTEM, vocabCheckPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface WordEntry {
  word: string
  definition: string
  sentence: string
}

export async function POST(request: Request) {
  try {
    const { words }: { words: WordEntry[] } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const anthropic = getAnthropicClient()

    const results = await Promise.all(
      words.map(async ({ word, definition, sentence }) => {
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 300,
          system: VOCAB_CHECK_SYSTEM,
          messages: [{ role: 'user', content: vocabCheckPrompt(word, definition, sentence, 'EN') }],
        })
        const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}'
        const result = parseClaudeJSON<{
          score: number
          is_correct: boolean
          corrected_sentence: string
          explanation: string
          encouragement: string
        }>(rawText)
        return { word, ...result }
      })
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error('vocab-check error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI 오류' },
      { status: 500 }
    )
  }
}
