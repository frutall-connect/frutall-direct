'use client'

import Image from 'next/image'
import Link from 'next/link'

type Props = {
  usuario: string
}

export default function PremiumHero({
  usuario
}: Props) {

  return (

    <div className="space-y-4">

      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <Image
          src="/logo-frutall-direct.png"
          alt="FrutALL Direct"
          width={180}
          height={70}
          priority
          className="h-14 w-auto"
        />

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <button
            className="
              w-12
              h-12
              rounded-2xl
              bg-white
              shadow-lg
              flex
              items-center
              justify-center
              text-3xl
            "
          >
            💬
          </button>

          <button
            className="
              w-12
              h-12
              rounded-2xl
              bg-white
              shadow-lg
              flex
              items-center
              justify-center
            "
          >

            <div className="space-y-1">

              <div className="w-6 h-1 rounded-full bg-black" />
              <div className="w-6 h-1 rounded-full bg-black" />
              <div className="w-6 h-1 rounded-full bg-black" />

            </div>

          </button>

        </div>

      </div>

      {/* HERO */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[2rem]
          p-5
          shadow-2xl
          min-h-[340px]
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
            bg-black/25
            backdrop-blur-[1px]
          "
        />

        {/* CONTENIDO */}

        <div
          className="
            relative
            z-10
            flex
            flex-col
            h-full
          "
        >

          {/* TEXOS */}

          <div>

            <h1
              className="
                text-white
                text-[2.2rem]
                leading-[2.4rem]
                font-black
              "
            >
              ¡Hola,
              <br />
              {usuario}!
            </h1>

            <p
              className="
                text-white/95
                text-lg
                mt-2
                font-medium
              "
            >
              Fruta fresca,
              calidad garantizada
            </p>

          </div>

          {/* BUSCADOR */}

          <div className="mt-6">

            <div
              className="
                h-16
                rounded-[1.6rem]
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
                  text-xl
                "
              >
                Buscar productos...
              </span>

              <span className="text-4xl">
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
              mt-5
            "
          >

            <Link href="/productos">

              <button
                className="
                  w-full
                  h-16
                  rounded-[1.6rem]
                  bg-white/88
                  backdrop-blur-xl
                  shadow-2xl
                  text-green-800
                  font-black
                  text-xl
                "
              >
                🛍️ Ver catálogo
              </button>

            </Link>

            <button
              className="
                h-16
                rounded-[1.6rem]
                bg-white/10
                border
                border-white/20
                backdrop-blur-xl
                shadow-2xl
                text-white
                font-black
                text-xl
              "
            >
              🏷️ Ofertas
            </button>

          </div>

        </div>

      </div>

    </div>

  )

}