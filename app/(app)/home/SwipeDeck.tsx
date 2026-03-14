'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Candidate } from '@/lib/swipe'
import { swipeAction } from './actions'
import MatchModal from '@/components/MatchModal'

interface Props {
  candidates: Candidate[]
}

export default function SwipeDeck({ candidates }: Props) {
  const [remaining, setRemaining] = useState<Candidate[]>(candidates)
  const [matchId, setMatchId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const startX = useRef(0)
  const router = useRouter()

  const current = remaining[0]

  async function handleSwipe(action: 'like' | 'skip') {
    if (!current) return
    const result = await swipeAction(current.id, action)
    if (result.matchId) {
      setMatchId(result.matchId)
    }
    setRemaining(prev => prev.slice(1))
    setDragX(0)
  }

  // タッチ操作
  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    setDragging(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    setDragX(e.touches[0].clientX - startX.current)
  }

  async function onTouchEnd() {
    setDragging(false)
    if (dragX > 80) await handleSwipe('like')
    else if (dragX < -80) await handleSwipe('skip')
    else setDragX(0)
  }

  // マウス操作
  function onMouseDown(e: React.MouseEvent) {
    startX.current = e.clientX
    setDragging(true)
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return
    setDragX(e.clientX - startX.current)
  }

  async function onMouseUp() {
    setDragging(false)
    if (dragX > 80) await handleSwipe('like')
    else if (dragX < -80) await handleSwipe('skip')
    else setDragX(0)
  }

  const age = current ? calcAge(current.birthdate) : 0
  const rotation = dragging ? dragX * 0.05 : 0
  const likeOpacity = Math.min(dragX / 100, 1)
  const skipOpacity = Math.min(-dragX / 100, 1)

  return (
    <div className="flex flex-col items-center gap-6">
      {current ? (
        <>
          {/* カード */}
          <div
            className="relative w-full max-w-sm h-[480px] rounded-2xl overflow-hidden shadow-xl cursor-grab active:cursor-grabbing select-none"
            style={{
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
              transition: dragging ? 'none' : 'transform 0.3s ease',
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {current.photos?.[0] ? (
              <Image
                src={current.photos[0]}
                alt={current.nickname}
                fill
                className="object-cover pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-6xl">👤</span>
              </div>
            )}

            {/* いいね / スキップ オーバーレイ */}
            <div
              className="absolute top-8 left-6 border-4 border-green-400 text-green-400 font-bold text-2xl px-3 py-1 rounded-lg rotate-[-20deg]"
              style={{ opacity: Math.max(likeOpacity, 0) }}
            >
              LIKE
            </div>
            <div
              className="absolute top-8 right-6 border-4 border-red-400 text-red-400 font-bold text-2xl px-3 py-1 rounded-lg rotate-[20deg]"
              style={{ opacity: Math.max(skipOpacity, 0) }}
            >
              NOPE
            </div>

            {/* プロフィール情報 */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <p className="text-xl font-bold">{current.nickname}, {age}</p>
              {current.region && <p className="text-sm opacity-80">📍 {current.region}</p>}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleSwipe('skip')}
              className="w-14 h-14 rounded-full bg-white shadow-md border border-gray-200 text-2xl flex items-center justify-center hover:scale-110 transition-transform"
            >
              ✕
            </button>
            <button
              onClick={() => handleSwipe('like')}
              className="w-16 h-16 rounded-full bg-rose-500 shadow-md text-white text-2xl flex items-center justify-center hover:scale-110 transition-transform"
            >
              ♥
            </button>
          </div>

          <p className="text-xs text-gray-400">残り {remaining.length} 人</p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
          <span className="text-5xl">🌟</span>
          <p className="text-gray-500 font-medium">今日の候補はここまでです</p>
          <p className="text-sm text-gray-400">また後でチェックしてみてください</p>
          <button
            onClick={() => router.refresh()}
            className="mt-2 px-4 py-2 bg-rose-500 text-white text-sm rounded-full hover:bg-rose-600 transition-colors"
          >
            更新する
          </button>
        </div>
      )}

      {matchId && (
        <MatchModal
          matchId={matchId}
          onClose={() => setMatchId(null)}
        />
      )}
    </div>
  )
}

function calcAge(birthdate: string): number {
  const birth = new Date(birthdate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}
