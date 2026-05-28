'use client'

import Link from 'next/link'

type Props = {
  usuario: string
}

export default function AppleHero({
  usuario
}: Props) {

  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-[2rem]
        h-[255px]
        shadow-xl
      "
    >

      {/* IMAGEN */}

      <div
        className="
          absolute
          inset-0
        "
        style={{

          backgroundImage:
            'url(https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1400&auto=format&fit=crop)',

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
          bg-black/28
        "
      />

      {/* CONTENIDO */}

      <div
        className="
          relative
          z-10
          h-full
          flex
          flex-col
          px-5
          pt-5
        "
      >

        {/* TEXTOS */}

        <div>

          <h1
            className="
              text-white
              text-[2rem]
              leading-[2.1rem]
              font-black
              tracking-tight
            "
          >
            ¡Hola,
            {usuario}!
          </h1>

          <p
            className="
              text-white/95
              text-[0.98rem]
              leading-[1.15rem]
              mt-2
              font-medium
            "
          >
            Fruta fresca,
            calidad garantizada
          </p>

        </div>

        {/* BUSCADOR */}

        <div className="mt-5">

          <div
            className="
              h-[56px]
              rounded-[1.5rem]
              bg-white/92
              backdrop-blur-xl
              shadow-xl
              px-5
              flex
              items-center
              justify-between
            "
          >

            <span
              className="
                text-gray-500
                text-[1rem]
                font-medium
              "
            >
              Buscar productos...
            </span>

            <span
              className="
                text-[1.8rem]
                text-green-700
              "
            >
              ⌕
            </span>

          </div>

        </div>

        {/* BOTONES */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            mt-4
          "
        >

          {/* CATALOGO */}

          <Link href="/productos">

            <button
              className="
                h-[54px]
                w-full
                rounded-[1.5rem]
                bg-white/90
                backdrop-blur-xl
                shadow-xl
                text-green-800
                font-black
                text-[0.98rem]
                flex
                items-center
                justify-center
              "
            >
              Ver catálogo
            </button>

          </Link>

          {/* OFERTAS */}

          <button
            className="
              h-[54px]
              rounded-[1.5rem]
              bg-white/12
              border
              border-white/20
              backdrop-blur-xl
              shadow-xl
              text-white
              font-black
              text-[0.98rem]
            "
          >
            Ofertas
          </button>

        </div>

      </div>

    </div>

  )

}