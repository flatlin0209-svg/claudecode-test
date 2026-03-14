'use server'

import { createClient } from '@/lib/supabase/server'
import { isValidNickname } from '@/lib/utils/validation'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '認証が必要です' }

  const nickname = (formData.get('nickname') as string).trim()
  const bio = (formData.get('bio') as string).trim()
  const region = (formData.get('region') as string).trim()
  const interests = formData.getAll('interests') as string[]

  if (!isValidNickname(nickname)) {
    return { error: 'ニックネームは1〜20文字で入力してください' }
  }

  // 現在の写真一覧を取得
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('photos')
    .eq('id', user.id)
    .single()

  const photos = currentProfile?.photos ?? []
  const isProfileComplete = nickname.length > 0 && photos.length > 0

  const { error } = await supabase.from('profiles').update({
    nickname,
    bio,
    region,
    interests,
    is_profile_complete: isProfileComplete,
  }).eq('id', user.id)

  if (error) return { error: 'プロフィールの保存に失敗しました' }

  revalidatePath('/profile')
  return { success: true }
}

export async function uploadPhotoAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '認証が必要です' }

  const file = formData.get('photo') as File

  if (!file || file.size === 0) return { error: 'ファイルを選択してください' }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'JPEG・PNG・WEBP形式の画像のみアップロードできます' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: '画像は5MB以下にしてください' }
  }

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}.${ext}`
  const path = `${user.id}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(path, file)

  if (uploadError) return { error: '画像のアップロードに失敗しました' }

  const { data: urlData } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(path)

  const photoUrl = urlData.publicUrl

  // 現在のphotos配列に追加
  const { data: profile } = await supabase
    .from('profiles')
    .select('photos, nickname')
    .eq('id', user.id)
    .single()

  const photos = [...(profile?.photos ?? []), photoUrl]
  if (photos.length > 5) return { error: '写真は最大5枚までです' }

  const isProfileComplete = (profile?.nickname?.length ?? 0) > 0

  await supabase.from('profiles').update({
    photos,
    is_profile_complete: isProfileComplete,
  }).eq('id', user.id)

  revalidatePath('/profile/edit')
  return { success: true, url: photoUrl }
}

export async function deletePhotoAction(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '認証が必要です' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('photos')
    .eq('id', user.id)
    .single()

  const photos = (profile?.photos ?? []).filter((p: string) => p !== url)

  await supabase.from('profiles').update({ photos }).eq('id', user.id)

  revalidatePath('/profile/edit')
  return { success: true }
}
