import Link from 'next/link'

export default function TopPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 px-4 text-center">
      <h1 className="text-4xl font-bold text-rose-500 mb-2">Matchly</h1>
      <p className="text-gray-500 mb-10">新しい出会いを見つけよう</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/register"
          className="bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full py-3 transition-colors"
        >
          新規登録
        </Link>
        <Link
          href="/login"
          className="border border-rose-400 text-rose-500 hover:bg-rose-50 font-semibold rounded-full py-3 transition-colors"
        >
          ログイン
        </Link>
      </div>
    </div>
  )
}
