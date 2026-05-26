import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/claude'
import { DAILY_REPORT_SYSTEM, DAILY_REPORT_USER } from '@/lib/math/prompts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { studentName, grade, topicTitle, correct, total, minutes, weakAreas, studentId, dayNumber } = await req.json()

    const client = getAnthropicClient()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      system: DAILY_REPORT_SYSTEM,
      messages: [
        {
          role: 'user',
          content: DAILY_REPORT_USER(studentName, grade, topicTitle, correct, total, minutes, weakAreas),
        },
      ],
    })

    const report = message.content[0].type === 'text' ? message.content[0].text : ''

    const today = new Date().toISOString().split('T')[0]

    await supabase.from('math_daily_reports').upsert({
      student_id: studentId,
      date: today,
      day_number: dayNumber,
      total_problems: total,
      correct_count: correct,
      time_minutes: minutes,
      weak_areas: weakAreas,
      ai_report: report,
    }, { onConflict: 'student_id,date' })

    return NextResponse.json({ report })
  } catch (err) {
    console.error('daily-report error:', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
