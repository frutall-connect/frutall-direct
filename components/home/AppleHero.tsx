'use client'

import Link from 'next/link'

export default function AppleHero({
  usuario
}: {
  usuario: string
}) {

  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-[2.2rem]
        h-[265px]
        shadow-[0_10px_35px_rgba(0,0,0,0.10)]
      "
    >

      {/* OVERLAY OSCURO SUPERIOR */}

      <div
        className="
          absolute
          inset-0
        "

        style={{

          background:
            `
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.28) 0%,
              rgba(0,0,0,0.10) 35%,
              rgba(255,255,255,0) 60%
            )
            `

        }}

      />

      {/* CONTENIDO */}

      <div
        className="
          relative
          z-10
          p-5
        "
      >

        {/* TITULO */}

        <h1
          className="
            text-white
            font-black
            tracking-[-0.05em]
            text-[2.2rem]
            leading-[2.1rem]
            drop-shadow-xl
            mt-1
          "
        >
          ¡Hola,
          {usuario}!
        </h1>

        {/* SUB */}

        <p
          className="
            text-white
            text-[1.15rem]
            font-semibold
            mt-2
            drop-shadow-lg
          "
        >
          Fruta fresca,
          calidad garantizada
        </p>

        {/* SEARCH */}

        <div
          className="
            mt-5
            h-[54px]
            rounded-full
            bg-white/92
            backdrop-blur-md
            flex
            items-center
            justify-between
            px-6
            shadow-xl
          "
        >

          <span
            className="
              text-gray-500
              text-[1rem]
            "
          >
            Buscar productos...
          </span>

          <span
            className="
              text-green-700
              text-[1.7rem]
            "
          >
            ⌕
          </span>

        </div>

        {/* BOTONES */}

        <div
          className="
            grid
            grid-cols-2
            gap-4
            mt-5
          "
        >

          {/* CATALOGO */}

          <Link href="/productos">

            <button
              className="
                w-full
                h-[58px]
                rounded-[1.8rem]
                bg-white/88
                backdrop-blur-md
                text-green-700
                text-[1.25rem]
                font-black
                shadow-xl
              "
            >
              Ver catálogo
            </button>

          </Link>

          {/* OFERTAS */}

          <button
            className="
              h-[58px]
              rounded-[1.8rem]
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