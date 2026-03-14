import { createClient } from '@/lib/supabase/server'
import ProfileEditForm from './ProfileEditForm'

const INTEREST_OPTIONS = [
  '映画', '音楽', '読書', '旅行', 'スポーツ', 'ゲーム',
  '料理', 'アウトドア', 'ファッション', 'アート', 'カフェ', 'ペット'
]

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">プロフィール編集</h1>
      <ProfileEditForm profile={profile} interestOptions={INTEREST_OPTIONS} />
    </div>
  )
}
