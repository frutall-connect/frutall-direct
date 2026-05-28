'use client'

import Link from 'next/link'

type Props = {
  usuario: string
}

export default function PremiumHero({
  usuario
}: Props) {

  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-[2.5rem]
        p-5
        shadow-2xl
      "
    >

      {/* FONDO */}

      <div
        className="
          absolute
          inset-0
        "
        style={{

          backgroundImage:
            'url(https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1200&auto=format&fit=crop)',

          backgroundSize:
            'cover',

          backgroundPosition:
            'center'

        }}
      />

      {/* OVERLAY */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-black/40
          via-green-900/20
          to-black/30
          backdrop-blur-[1px]
        "
      />

      {/* CONTENIDO */}

      <div className="relative z-10">

        {/* TOP */}

        <div
          className="
            flex
            items-start
            justify-between
          "
        >

          <div>

            <h1
              className="
                text-white
                text-4xl
                font-black
                leading-tight
              "
            >
              ¡Hola,
              <br />
              {usuario}!
            </h1>

            <p
              className="
                text-white/90
                mt-2
                text-base
              "
            >
              Fruta fresca,
              calidad garantizada
            </p>

          </div>

          <button
            className="
              w-14
              h-14
              rounded-2xl
              bg-white/15
              backdrop-blur-xl
              border
              border-white/20
              text-white
              text-3xl
              flex
              items-center
              justify-center
            "
          >
            💬
          </button>

        </div>

        {/* BUSCADOR */}

        <div className="mt-6">

          <div
            className="
              h-14
              rounded-2xl
              bg-white/90
              backdrop-blur
              px-5
              flex
              items-center
              justify-between
              shadow-lg
            "
          >

            <span
              className="
                text-gray-500
                text-lg
              "
            >
              Buscar productos...
            </span>

            <span className="text-3xl">
              🔍
            </span>

          </div>

        </div>

        {/* BOTONES */}

        <div
          className="
            grid
            grid-cols-2
            gap-4
            mt-6
          "
        >

          <Link href="/productos">

            <button
              className="
                w-full
                h-16
                rounded-2xl
                bg-white/90
                backdrop-blur-xl
                text-green-800
                font-black
                text-lg
                shadow-xl
              "
            >
              🛍️ Ver catálogo
            </button>

          </Link>

          <button
            className="
              h-16
              rounded-2xl
              bg-white/10
              border
              border-white/20
              backdrop-blur-xl
              text-white
              font-black
              text-lg
            "
          >
            🏷️ Ofertas
          </button>

        </div>

      </div>

    </div>

  )

}