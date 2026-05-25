import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from '@/components/layout/SidebarNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/setup')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNav profile={profile} />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
