'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/(auth)/login/actions'

interface NavigationProps {
  userId: string
}

export default function Navigation({ userId }: NavigationProps) {
  const pathname = usePathname()

  const links = [
    { href: '/home', label: 'スワイプ', icon: '🔥' },
    { href: '/matches', label: 'マッチング', icon: '💬' },
    { href: '/profile', label: 'プロフィール', icon: '👤' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around px-4 py-2 z-50">
      {links.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
            pathname.startsWith(href)
              ? 'text-rose-500'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="text-xl">{icon}</span>
          <span className="text-xs">{label}</span>
        </Link>
      ))}
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex flex-col items-center gap-0.5 px-4 py-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="text-xs">ログアウト</span>
        </button>
      </form>
    </nav>
  )
}
