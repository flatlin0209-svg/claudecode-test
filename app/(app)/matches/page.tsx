import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

interface MatchWithProfile {
  id: string
  partner: {
    id: string
    nickname: string
    photos: string[]
  }
  unreadCount: number
  lastMessage: string | null
  createdAt: string
}

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('id, user1_id, user2_id, created_at')
    .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`)
    .order('created_at', { ascending: false })

  if (!matches || matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4 py-8">
        <span className="text-5xl mb-4">💔</span>
        <p className="text-gray-500">まだマッチングがありません</p>
        <p className="text-sm text-gray-400 mt-1">スワイプして相手を見つけましょう！</p>
      </div>
    )
  }

  // 相手プロフィールと未読数を取得
  const matchesWithProfiles: MatchWithProfile[] = await Promise.all(
    matches.map(async (match) => {
      const partnerId = match.user1_id === user!.id ? match.user2_id : match.user1_id

      const { data: partner } = await supabase
        .from('profiles')
        .select('id, nickname, photos')
        .eq('id', partnerId)
        .single()

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', match.id)
        .eq('is_read', false)
        .neq('sender_id', user!.id)

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content')
        .eq('match_id', match.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return {
        id: match.id,
        partner: partner ?? { id: partnerId, nickname: '不明', photos: [] },
        unreadCount: unreadCount ?? 0,
        lastMessage: lastMsg?.content ?? null,
        createdAt: match.created_at,
      }
    })
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">マッチング一覧</h1>
      <div className="space-y-2">
        {matchesWithProfiles.map((match) => (
          <Link
            key={match.id}
            href={`/chat/${match.id}`}
            className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {match.partner.photos?.[0] ? (
                <Image
                  src={match.partner.photos[0]}
                  alt={match.partner.nickname}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">{match.partner.nickname}</p>
              <p className="text-sm text-gray-400 truncate">
                {match.lastMessage ?? 'メッセージを送ってみましょう'}
              </p>
            </div>
            {match.unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                {match.unreadCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
