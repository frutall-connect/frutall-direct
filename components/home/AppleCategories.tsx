'use client'

import Link from 'next/link'

type Props = {
  categorias: any[]
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

      {categorias.map(
        (categoria) => (

          <Link
            key={categoria.id}
            href={`/productos?categoria=${categoria.nombre}`}
          >

            <div
              className="
                bg-white
                rounded-[1.7rem]
                p-4
                shadow-sm
                border
                border-gray-100
                h-[108px]
                flex
                flex-col
                justify-between
                active:scale-[0.98]
                transition
              "
            >

              {/* ICONO */}

              <div
                className="
                  text-[2rem]
                  leading-none
                "
              >
                {categoria.icono}
              </div>

              {/* TEXTO */}

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
                    font-black
                    tracking-tight
                    text-black
                  "
                >
                  {categoria.nombre}
                </span>

                <span
                  className="
                    text-gray-400
                    text-[1.3rem]
                    font-light
                  "
                >
                  →
                </span>

              </div>

            </div>

          </Link>

        )
      )}

    </div>

  )

}