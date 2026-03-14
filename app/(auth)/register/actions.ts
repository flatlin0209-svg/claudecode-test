'use server'

import { createClient } from '@/lib/supabase/server'
import { isAdult } from '@/lib/utils/validation'
import { redirect } from 'next/navigation'

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const birthdate = formData.get('birthdate') as string
  const gender = formData.get('gender') as string

  if (password !== confirmPassword) {
    return { error: 'パスワードが一致しません' }
  }

  if (password.length < 8) {
    return { error: 'パスワードは8文字以上で入力してください' }
  }

  if (!isAdult(birthdate)) {
    return { error: '18歳未満の方はご利用いただけません' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'このメールアドレスは既に登録されています' }
    }
    return { error: '登録に失敗しました。しばらくしてからお試しください' }
  }

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      nickname: '',
      gender,
      birthdate,
      is_profile_complete: false,
    })

    if (profileError) {
      return { error: 'プロフィールの作成に失敗しました' }
    }
  }

  redirect('/profile/edit')
}
