'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMessageAction(matchId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '認証が必要です' }

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 500) return { error: 'メッセージは1〜500文字で入力してください' }

  const { error } = await supabase.from('messages').insert({
    match_id: matchId,
    sender_id: user.id,
    content: trimmed,
  })

  if (error) return { error: 'メッセージの送信に失敗しました' }
  return { success: true }
}

export async function markAsReadAction(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('match_id', matchId)
    .neq('sender_id', user.id)
    .eq('is_read', false)
}
