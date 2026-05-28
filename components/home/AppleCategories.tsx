'use client'

import Link from 'next/link'

const categoriasMock = [

  {
    nombre: 'Frutas',
    icono: '🍎'
  },

  {
    nombre: 'Verduras',
    icono: '🥬'
  },

  {
    nombre: 'Tubérculos',
    icono: '🥔'
  },

  {
    nombre: 'Temporada',
    icono: '🍅'
  }

]

export default function AppleCategories() {

  return (

    <div
      className="
        flex
        gap-3
        overflow-x-auto
        mt-5
        pb-1
        no-scrollbar
      "
    >

      {categoriasMock.map((categoria) => (

        <Link
          key={categoria.nombre}
          href={`/productos?categoria=${categoria.nombre}`}
        >

          <div
            className="
              min-w-[88px]
              h-[118px]
              bg-white
              rounded-[1.5rem]
              border
              border-[#ededed]
              shadow-[0_4px_10px_rgba(0,0,0,0.05)]
              px-3
              py-3
              flex
              flex-col
              justify-between
            "
          >

            {/* ICONO */}

            <div
              className="
                text-[2.5rem]
                leading-none
                text-center
                mt-1
              "
            >
              {categoria.icono}
            </div>

            {/* TEXTO */}

            <div>

              <div
                className="
                  text-[0.95rem]
                  font-semibold
                  text-black
                  tracking-[-0.02em]
                  text-center
                "
              >
                {categoria.nombre}
              </div>

              <div
                className="
                  text-gray-400
                  text-[1.3rem]
                  leading-none
                  text-right
                  mt-1
                "
              >
                →
              </div>

            </div>

          </div>

        </Link>

      ))}

    </div>

  )

}