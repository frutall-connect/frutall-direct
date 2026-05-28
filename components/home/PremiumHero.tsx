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

    <div className="space-y-3">

      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          px-1
        "
      >

        <Image
          src="/logo-frutall-direct.png"
          alt="FrutALL Direct"
          width={220}
          height={80}
          priority
          className="
            h-[72px]
            w-auto
            object-contain
          "
        />

        <div
          className="
            flex
            items-center
            gap-4
            pr-1
          "
        >

          {/* WHATSAPP */}

          <button
            className="
              text-[3rem]
              leading-none
            "
          >
            💬
          </button>

          {/* MENÚ */}

          <button
            className="
              flex
              flex-col
              justify-center
              gap-[5px]
            "
          >

            <div className="w-9 h-[4px] rounded-full bg-black" />
            <div className="w-9 h-[4px] rounded-full bg-black" />
            <div className="w-9 h-[4px] rounded-full bg-black" />

          </button>

        </div>

      </div>

      {/* HERO */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[2rem]
          shadow-2xl
          h-[360px]
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
              'url(https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1600&auto=format&fit=crop)',

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
            bg-black/30
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
            pt-7
          "
        >

          {/* TEXOS */}

          <div>

            <h1
              className="
                text-white
                text-[3rem]
                leading-[3rem]
                font-black
                tracking-tight
              "
            >
              ¡Hola,
              {usuario}!
            </h1>

            <p
              className="
                text-white
                text-[1.55rem]
                leading-[1.7rem]
                mt-3
                font-semibold
              "
            >
              Fruta fresca,
              calidad garantizada
            </p>

          </div>

          {/* BUSCADOR */}

          <div className="mt-7">

            <div
              className="
                h-[74px]
                rounded-[2rem]
                bg-white/95
                backdrop-blur-xl
                px-7
                flex
                items-center
                justify-between
                shadow-2xl
              "
            >

              <span
                className="
                  text-gray-500
                  text-[1.8rem]
                  font-medium
                "
              >
                Buscar productos...
              </span>

              <span className="text-[3rem]">
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
                  h-[76px]
                  w-full
                  rounded-[2rem]
                  bg-white/92
                  backdrop-blur-xl
                  shadow-2xl
                  text-green-800
                  font-black
                  text-[1.5rem]
                "
              >
                🛍️ Ver catálogo
              </button>

            </Link>

            <button
              className="
                h-[76px]
                rounded-[2rem]
                bg-white/12
                border
                border-white/25
                backdrop-blur-xl
                shadow-2xl
                text-white
                font-black
                text-[1.5rem]
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