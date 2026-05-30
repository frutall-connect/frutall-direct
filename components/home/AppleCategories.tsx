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
        grid
        grid-cols-4
        gap-2
        mt-5
      "
    >

      {categoriasMock.map((categoria) => (

        <Link
          key={categoria.nombre}
          href={'/productos?categoria=' + categoria.nombre}
        >

          <div
            className="
              h-[84px]
              bg-white/60
              backdrop-blur-md
              rounded-[1.4rem]
              border
              border-white/40
              shadow-[0_4px_12px_rgba(0,0,0,0.6)]
              px-2
              py-2
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                text-[1.9rem]
                leading-none
                text-center
                mt-1
              "
            >
              {categoria.icono}
            </div>

            <div>

              <div
                className="
                  text-[0.78rem]
                  font-semibold
                  text-black
                  tracking-[-0.02em]
                  text-center
                "
              >
                {categoria.nombre}
              </div>

            </div>

          </div>

        </Link>

      ))}

    </div>

  )

}