'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ShoppingBag,
  ClipboardList,
  User
} from 'lucide-react'

const items = [
  {
    href: '/',
    label: 'Inicio',
    icon: Home,
  },
  {
    href: '/productos',
    label: 'Productos',
    icon: ShoppingBag,
  },
  {
    href: '/pedidos',
    label: 'Pedidos',
    icon: ClipboardList,
  },
  {
    href: '/cuenta',
    label: 'Cuenta',
    icon: User,
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex justify-around items-center max-w-md mx-auto">
      {items.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center text-xs ${
              active
                ? 'text-green-600'
                : 'text-gray-400'
            }`}
          >
            <Icon size={22} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}