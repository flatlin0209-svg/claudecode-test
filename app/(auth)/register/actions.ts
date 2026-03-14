'use server'

import { createClient } from '@/lib/supabase/server'
import { isAdult } from '@/lib/utils/validation'

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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { gender, birthdate }, // トリガーで profiles に自動挿入される
    },
  })

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('User already registered')) {
      return { error: 'このメールアドレスは既に登録されています' }
    }
    return { error: `登録に失敗しました: ${error.message}` }
  }

  return { success: true }
}
