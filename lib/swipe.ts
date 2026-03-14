import { createClient } from '@/lib/supabase/server'

export interface Candidate {
  id: string
  nickname: string
  birthdate: string
  region: string | null
  photos: string[]
  interests: string[]
  bio: string | null
}

/**
 * スワイプ候補ユーザーを取得する（最大20件）
 * - 自分と異なる性別
 * - 18歳以上
 * - プロフィール設定済み
 * - 自分がまだスワイプしていないユーザー
 */
export async function getCandidates(userId: string, gender: string): Promise<Candidate[]> {
  const supabase = await createClient()

  const oppositeGender = gender === 'male' ? 'female' : 'male'

  // 既にスワイプ済みのIDを取得
  const { data: swiped } = await supabase
    .from('swipe_actions')
    .select('target_id')
    .eq('actor_id', userId)

  const swipedIds = (swiped ?? []).map((s: { target_id: string }) => s.target_id)

  // 18歳以上の誕生日上限
  const today = new Date()
  const maxBirthdate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  ).toISOString().split('T')[0]

  let query = supabase
    .from('profiles')
    .select('id, nickname, birthdate, region, photos, interests, bio')
    .eq('gender', oppositeGender)
    .eq('is_profile_complete', true)
    .neq('id', userId)
    .lte('birthdate', maxBirthdate)
    .limit(20)

  if (swipedIds.length > 0) {
    query = query.not('id', 'in', `(${swipedIds.join(',')})`)
  }

  const { data } = await query
  return (data ?? []) as Candidate[]
}

/**
 * スワイプを記録し、マッチング判定を行う
 * @returns マッチング成立した場合は matchId を返す
 */
export async function recordSwipe(
  actorId: string,
  targetId: string,
  action: 'like' | 'skip'
): Promise<{ matchId: string | null }> {
  const supabase = await createClient()

  // UPSERT でスワイプを記録（二重送信防止）
  await supabase.from('swipe_actions').upsert(
    { actor_id: actorId, target_id: targetId, action },
    { onConflict: 'actor_id,target_id' }
  )

  if (action !== 'like') return { matchId: null }

  // 相互いいね確認
  const { data: mutual } = await supabase
    .from('swipe_actions')
    .select('id')
    .eq('actor_id', targetId)
    .eq('target_id', actorId)
    .eq('action', 'like')
    .single()

  if (!mutual) return { matchId: null }

  // マッチング作成（user1_id < user2_id で一意キー管理）
  const [user1, user2] = [actorId, targetId].sort()

  const { data: existing } = await supabase
    .from('matches')
    .select('id')
    .eq('user1_id', user1)
    .eq('user2_id', user2)
    .single()

  if (existing) return { matchId: existing.id }

  const { data: newMatch } = await supabase
    .from('matches')
    .insert({ user1_id: user1, user2_id: user2 })
    .select('id')
    .single()

  return { matchId: newMatch?.id ?? null }
}
