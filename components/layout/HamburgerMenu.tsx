'use client'

import { useState } from 'react'

import Link from 'next/link'

import { supabase } from '@/lib/supabaseClient'

export default function HamburgerMenu() {

  const [open, setOpen] = useState(false)

  async function logout() {

    await supabase.auth.signOut()

    window.location.href = '/login'

  }

  return (

    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="
          bg-white
          w-12
          h-12
          rounded-2xl
          shadow
          text-2xl
        "
      >
        ☰
      </button>

      {open && (

        <div
          className="
            absolute
            right-0
            mt-2
            w-56
            bg-white
            rounded-2xl
            shadow-xl
            overflow-hidden
            z-50
          "
        >

          <Link
            href="/"
            className="block px-4 py-3 hover:bg-gray-100"
          >
            🏠 Inicio
          </Link>

          <Link
            href="/productos"
            className="block px-4 py-3 hover:bg-gray-100"
          >
            🥬 Productos
          </Link>

          <Link
            href="/carrito"
            className="block px-4 py-3 hover:bg-gray-100"
          >
            🛒 Carrito
          </Link>

          <Link
            href="/pedidos"
            className="block px-4 py-3 hover:bg-gray-100"
          >
            📦 Pedidos
          </Link>

          <button
            onClick={logout}
            className="
              w-full
              text-left
              px-4
              py-3
              text-red-600
              hover:bg-red-50
            "
          >
            🚪 Cerrar sesión
          </button>

        </div>

      )}

    </div>

  )

}