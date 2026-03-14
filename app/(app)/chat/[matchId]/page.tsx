import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ChatWindow from './ChatWindow'
import { markAsReadAction } from './actions'

interface Props {
  params: Promise<{ matchId: string }>
}

export default async function ChatPage({ params }: Props) {
  const { matchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // マッチング存在確認
  const { data: match } = await supabase
    .from('matches')
    .select('id, user1_id, user2_id')
    .eq('id', matchId)
    .single()

  if (!match) notFound()

  const partnerId = match.user1_id === user!.id ? match.user2_id : match.user1_id

  const { data: partner } = await supabase
    .from('profiles')
    .select('nickname, photos')
    .eq('id', partnerId)
    .single()

  const { data: initialMessages } = await supabase
    .from('messages')
    .select('id, sender_id, content, is_read, created_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })

  // 既読処理
  await markAsReadAction(matchId)

  return (
    <ChatWindow
      matchId={matchId}
      currentUserId={user!.id}
      partner={partner ?? { nickname: '不明', photos: [] }}
      initialMessages={initialMessages ?? []}
    />
  )
}
