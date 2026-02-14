import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './actions'
import BookmarkManager from '@/components/BookmarkManager'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black">Member Berries</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-black">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Logout
            </button>
          </form>

        </div>
      </div>
      <BookmarkManager user={user} />
    </main>
  )
}