'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerAction } from './actions'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const result = await registerAction(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center text-rose-500 mb-6">新規登録</h1>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（8文字以上）
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（確認）
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生年月日
            </label>
            <input
              type="date"
              name="birthdate"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性別
            </label>
            <select
              name="gender"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="">選択してください</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold rounded-lg py-2 transition-colors"
          >
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          既にアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-rose-500 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
