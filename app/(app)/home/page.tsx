import { createClient } from '@/lib/supabase/server'
import { getCandidates } from '@/lib/swipe'
import SwipeDeck from './SwipeDeck'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('gender')
    .eq('id', user!.id)
    .single()

  const candidates = await getCandidates(user!.id, profile?.gender ?? 'male')

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="max-w-sm mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-rose-500 text-center mb-4">Matchly</h1>
        <SwipeDeck candidates={candidates} />
      </div>
    </div>
  )
}
