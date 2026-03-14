'use server'

import { recordSwipe } from '@/lib/swipe'
import { createClient } from '@/lib/supabase/server'

export async function swipeAction(
  targetId: string,
  action: 'like' | 'skip'
): Promise<{ matchId: string | null; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { matchId: null, error: '認証が必要です' }

  const { matchId } = await recordSwipe(user.id, targetId, action)
  return { matchId }
}
