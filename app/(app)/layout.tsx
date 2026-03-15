import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Navigation from '@/components/Navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? headersList.get('x-invoke-path') ?? ''

  // プロフィール未設定かつ /profile/edit 以外ならリダイレクト
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_profile_complete')
    .eq('id', user.id)
    .single()

  if (profile && !profile.is_profile_complete && !pathname.includes('/profile/edit')) {
    redirect('/profile/edit')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">{children}</main>
      <Navigation userId={user.id} />
    </div>
  )
}
