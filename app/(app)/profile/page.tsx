import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  if (!profile) return null

  const birthDate = new Date(profile.birthdate)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {/* メイン写真 */}
        {profile.photos?.[0] ? (
          <div className="relative h-72 w-full">
            <Image
              src={profile.photos[0]}
              alt="profile"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-72 bg-gray-100 flex items-center justify-center">
            <span className="text-5xl text-gray-300">👤</span>
          </div>
        )}

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              {profile.nickname || '（未設定）'}
              <span className="text-lg font-normal text-gray-500 ml-2">{age}歳</span>
            </h1>
            <Link
              href="/profile/edit"
              className="text-sm text-rose-500 hover:underline"
            >
              編集
            </Link>
          </div>

          {profile.region && (
            <p className="text-sm text-gray-500">📍 {profile.region}</p>
          )}

          {profile.bio && (
            <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
          )}

          {profile.interests?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {profile.interests.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-rose-50 text-rose-500 text-xs rounded-full border border-rose-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* サブ写真 */}
          {profile.photos?.length > 1 && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              {profile.photos.slice(1).map((url: string, i: number) => (
                <div key={url} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image src={url} alt={`photo-${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
