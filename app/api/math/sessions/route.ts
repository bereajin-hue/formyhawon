import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { data: sessions } = await supabase
      .from('math_sessions')
      .select('*')
      .eq('student_id', profile.id)
      .order('day_number', { ascending: true })

    return NextResponse.json({ sessions: sessions ?? [] })
  } catch (err) {
    console.error('sessions GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { dayNumber, topicTitle } = await req.json()
    const today = new Date().toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('math_sessions')
      .select('*')
      .eq('student_id', profile.id)
      .eq('day_number', dayNumber)
      .maybeSingle()

    if (existing) return NextResponse.json({ session: existing })

    const { data: session, error } = await supabase
      .from('math_sessions')
      .insert({
        student_id: profile.id,
        day_number: dayNumber,
        topic_title: topicTitle,
        status: 'not_started',
        xp_earned: 0,
        date: today,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ session })
  } catch (err) {
    console.error('sessions POST error:', err)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sessionId, updates } = await req.json()

    const { data: session, error } = await supabase
      .from('math_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ session })
  } catch (err) {
    console.error('sessions PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}
