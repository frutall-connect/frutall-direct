'use client'

import Link from 'next/link'

type Props = {
  categorias: any[]
}

const iconos: Record<string, string> = {

  Frutas: '🍎',
  Verduras: '🥬',
  Tubérculos: '🥔',
  Temporada: '🍅'

}

export default function AppleCategories({
  categorias
}: Props) {

  return (

    <div
      className="
        grid
        grid-cols-2
        gap-3
        mt-5
      "
    >

      {categorias.map((categoria) => (

        <Link
          key={categoria.id}
          href={`/productos?categoria=${categoria.nombre}`}
        >

          <div
            className="
              bg-white
              rounded-[1.8rem]
              px-4
              py-4
              h-[108px]
              border
              border-[#ececec]
              shadow-[0_4px_12px_rgba(0,0,0,0.05)]
              flex
              flex-col
              justify-between
            "
          >

            {/* ICONO */}

            <div
              className="
                text-[2rem]
                leading-none
              "
            >
              {iconos[categoria.nombre] || '📦'}
            </div>

            {/* FOOTER */}

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span
                className="
                  text-[1rem]
                  font-bold
                  text-black
                  tracking-[-0.02em]
                "
              >
                {categoria.nombre}
              </span>

              <span
                className="
                  text-gray-400
                  text-[1.5rem]
                  leading-none
                  font-light
                "
              >
                →
              </span>

            </div>

          </div>

        </Link>

      ))}

    </div>

  )

}