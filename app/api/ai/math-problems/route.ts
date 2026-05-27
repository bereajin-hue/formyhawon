import { getAnthropicClient, parseClaudeJSON } from '@/lib/claude'
import { createClient } from '@/lib/supabase/server'
import { MATH_PROBLEM_SYSTEM, mathProblemPrompt } from '@/lib/prompts'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { topicId, grade, level } = await request.json()
    const supabase = await createClient()

    // 1. curriculum_math_topics에서 토픽 데이터 조회
    const { data: topicData, error } = await supabase
      .from('curriculum_math_topics')
      .select('unit_name, topic_name, difficulty, igcse_syllabus_ref, key_skills, prerequisites')
      .eq('id', topicId)
      .single()

    if (error || !topicData) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // 2. Claude API 호출
    const anthropic = getAnthropicClient()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: MATH_PROBLEM_SYSTEM,
      messages: [{
        role: 'user',
        content: mathProblemPrompt(grade, topicData, level ?? 'core'),
      }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const content = parseClaudeJSON(rawText)

    return NextResponse.json(content)
  } catch (error) {
    console.error('math-problems error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI 생성 오류' },
      { status: 500 }
    )
  }
}
