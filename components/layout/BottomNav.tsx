'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  {
    label: 'Inicio',
    href: '/inicio',
    icon: '🏠',
  },
  {
    label: 'Productos',
    href: '/productos',
    icon: '🍎',
  },
  {
    label: 'Pedidos',
    href: '/pedidos',
    icon: '📦',
  },
  {
    label: 'Cuenta',
    href: '/cuenta',
    icon: '👤',
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-center z-50">

      <div className="w-full max-w-md bg-white border-t shadow-lg flex justify-around py-3">

        {items.map((item) => {
          const active = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center text-sm ${
                active
                  ? 'text-green-700 font-bold'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-xl">
                {item.icon}
              </span>

              {item.label}
            </Link>
          )
        })}

      </div>

    </nav>
  )
}