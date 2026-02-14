import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './actions'
import BookmarkManager from '@/components/BookmarkManager'
import DashboardShell from '@/components/DashboardShell'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardShell user={user}>
      <BookmarkManager user={user} />
    </DashboardShell>
  )
}