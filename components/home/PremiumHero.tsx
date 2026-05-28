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

        {/* LOGO */}

        <Image
          src="/logo-frutall-direct.png"
          alt="FrutALL Direct"
          width={165}
          height={60}
          priority
          className="
            h-[54px]
            w-auto
            object-contain
          "
        />

        {/* ICONOS */}

        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          {/* WHATSAPP */}

          <button
            className="
              text-[2.2rem]
              leading-none
            "
          >
            <span className="text-green-600">
              ⓦ
            </span>
          </button>

          {/* MENU */}

          <button
            className="
              flex
              flex-col
              justify-center
              gap-[4px]
            "
          >

            <div className="w-8 h-[3px] rounded-full bg-black" />
            <div className="w-8 h-[3px] rounded-full bg-black" />
            <div className="w-8 h-[3px] rounded-full bg-black" />

          </button>

        </div>

      </div>

      {/* HERO */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[2rem]
          h-[290px]
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
            pt-5
          "
        >

          {/* TITULO */}

          <div>

            <h1
              className="
                text-white
                text-[2.35rem]
                leading-[2.45rem]
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
                text-[1.05rem]
                leading-[1.2rem]
                mt-2
                font-semibold
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
                h-[58px]
                rounded-[1.7rem]
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
                  text-[1.15rem]
                  font-medium
                "
              >
                Buscar productos...
              </span>

              <span
                className="
                  text-[2.1rem]
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
              gap-4
              mt-5
            "
          >

            {/* CATALOGO */}

            <Link href="/productos">

              <button
                className="
                  h-[58px]
                  w-full
                  rounded-[1.6rem]
                  bg-white/88
                  backdrop-blur-xl
                  shadow-xl
                  text-green-800
                  font-black
                  text-[1.05rem]
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >

                <span className="text-xl">
                  ⌂
                </span>

                Ver catálogo

              </button>

            </Link>

            {/* OFERTAS */}

            <button
              className="
                h-[58px]
                rounded-[1.6rem]
                bg-white/12
                border
                border-white/20
                backdrop-blur-xl
                shadow-xl
                text-white
                font-black
                text-[1.05rem]
                flex
                items-center
                justify-center
                gap-2
              "
            >

              <span className="text-lg">
                ⌑
              </span>

              Ofertas

            </button>

          </div>

        </div>

      </div>

    </div>

  )

}