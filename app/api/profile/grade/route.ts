import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { grade } = await request.json()

    if (![8, 9, 10, 11].includes(grade)) {
      return NextResponse.json({ error: 'Invalid grade' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('profiles')
      .update({ grade })
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, grade })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
