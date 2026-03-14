'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { sendMessageAction } from './actions'

interface Message {
  id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface Partner {
  nickname: string
  photos: string[]
}

interface Props {
  matchId: string
  currentUserId: string
  partner: Partner
  initialMessages: Message[]
}

export default function ChatWindow({ matchId, currentUserId, partner, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Supabase Realtime 購読
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages(prev => {
            // 重複防止
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId])

  // 最下部に自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || sending) return
    const content = input
    setInput('')
    setSending(true)
    await sendMessageAction(matchId, content)
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 mr-1">
          ←
        </button>
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {partner.photos?.[0] ? (
            <Image src={partner.photos[0]} alt={partner.nickname} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">👤</div>
          )}
        </div>
        <p className="font-semibold text-gray-800">{partner.nickname}</p>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">
            最初のメッセージを送ってみましょう！
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm break-words ${
                    isMe
                      ? 'bg-rose-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 入力欄 */}
      <div className="flex items-end gap-2 bg-white border-t border-gray-200 px-4 py-3 pb-safe flex-shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
          rows={1}
          placeholder="メッセージを入力..."
          className="flex-1 border border-gray-300 rounded-2xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-400 max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
