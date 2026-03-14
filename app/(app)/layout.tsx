import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // プロフィール未設定はプロフィール編集へ
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_profile_complete')
    .eq('id', user.id)
    .single()

  const isEditPage = false // middleware でハンドリング済み

  if (profile && !profile.is_profile_complete) {
    // /profile/edit 以外にいる場合はリダイレクト
    redirect('/profile/edit')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">{children}</main>
      <Navigation userId={user.id} />
    </div>
  )
}
