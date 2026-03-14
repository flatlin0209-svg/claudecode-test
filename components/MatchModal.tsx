'use client'

import { useRouter } from 'next/navigation'

interface Props {
  matchId: string
  onClose: () => void
}

export default function MatchModal({ matchId, onClose }: Props) {
  const router = useRouter()

  function goToChat() {
    router.push(`/chat/${matchId}`)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm w-full animate-bounce-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-rose-500 mb-2">マッチング成立！</h2>
        <p className="text-gray-500 text-sm mb-6">
          おめでとうございます！メッセージを送ってみましょう
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={goToChat}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full py-3 transition-colors"
          >
            チャットを始める
          </button>
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold rounded-full py-3 transition-colors"
          >
            スワイプに戻る
          </button>
        </div>
      </div>
    </div>
  )
}
