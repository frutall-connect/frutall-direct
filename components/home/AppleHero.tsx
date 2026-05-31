'use client'

import Link from 'next/link'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabaseClient'

export default function AppleHero({
  usuario
}: {
  usuario: string
}) {

  const [busqueda, setBusqueda] =
    useState('')

  const router =
    useRouter()

// =====================================================
// FRUTALL-HERO-DINAMICO
// =====================================================

const [hero, setHero] =
  useState<any>(null)

async function cargarHero() {

  const { data, error } =
    await supabase
      .from('hero_home')
      .select('*')
      .eq('activa', true)
      .single()

  console.log('HERO DATA:', data)
  console.log('HERO ERROR:', error)

  if (!error && data) {
    setHero(data)
  }

}

useEffect(() => {

  cargarHero()

}, [])

// =====================================================
// FIN FRUTALL-HERO-DINAMICO
// =====================================================

  function buscar() {

    if (!busqueda.trim()) return

    router.push(
      `/productos?q=${encodeURIComponent(busqueda)}`
    )

  }

  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-[2rem]
        bg-white/10
        backdrop-blur-sm
      "
    >
  <div
    className="
      relative
      z-10
      px-4
      pt-4
      pb-4
    "
  >

    <h3
      className="
        text-white
        font-black
        tracking-[-0.05em]
        text-[1.5rem]
        leading-[1.95rem]
        drop-shadow-xl
      "
    >
      ¡Hola, {usuario}!
    </h3>

<p className="text-red-500 text-xs">
  {hero ? JSON.stringify(hero) : 'SIN HERO'}
</p>

    <p
      className="
        text-white
        text-[1rem]
        font-semibold
        mt-1
        drop-shadow-lg
      "
    >
      {
  hero?.subtitulo ||
  'Fruta fresca, calidad garantizada'
}
    </p>

<div
  className="
    mt-4
    h-[52px]
    rounded-full
    bg-white/92
    backdrop-blur-md
    flex
    items-center
    px-5
    shadow-xl
  "
>

  <input
    type="text"
    value={busqueda}
    onChange={(e) =>
      setBusqueda(e.target.value)
    }
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        buscar()
      }
    }}
    placeholder="Buscar productos..."
    className="
      flex-1
      bg-transparent
      outline-none
      text-black
    "
  />

  <button
    onClick={buscar}
    className="
      text-green-700
      text-[1.6rem]
      ml-2
    "
  >
    ⌕
  </button>

</div>

    <div
      className="
        grid
        grid-cols-2
        gap-3
        mt-4
      "
    >

      <Link href="/productos">

        <button
          className="
            w-full
            h-[54px]
            rounded-[1.5rem]
            bg-white/75
            backdrop-blur-md
            text-green-700
            text-[1rem]
            font-black
            shadow-xl
          "
        >
          Ver catálogo
        </button>

      </Link>

      <button
        className="
          h-[54px]
          rounded-[1.5rem]
          bg-white/12
          border
          border-white/30
          backdrop-blur-md
          text-white
          text-[1rem]
          font-black
          shadow-xl
        "
      >
        Ofertas
      </button>

    </div>

  </div>

</div>

)

}