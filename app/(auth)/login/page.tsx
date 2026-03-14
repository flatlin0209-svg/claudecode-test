'use client'

import { useState } from 'react'
import Link from 'next/link'
import { loginAction } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const result = await loginAction(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center text-rose-500 mb-6">ログイン</h1>

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
              パスワード
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold rounded-lg py-2 transition-colors"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="text-rose-500 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
