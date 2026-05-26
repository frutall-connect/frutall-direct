'use client'

import {

  useEffect,
  useState

} from 'react'

import {

  supabase

} from '@/lib/supabaseClient'

export default function AdminVariedadesPage() {

  const [variedades, setVariedades] =
    useState<any[]>([])

  useEffect(() => {

    cargar()

  }, [])

  async function cargar() {

    const { data } =
      await supabase

        .from(
          'variedades_producto'
        )

        .select(`
          *,
          productos_base (
            nombre
          )
        `)

        .order('nombre')

    setVariedades(data || [])

  }

  return (

    <main
      className="
        min-h-screen
        bg-[#f5f3eb]
        p-5
      "
    >

      <h1
        className="
          text-4xl
          font-black
          mb-6
        "
      >

        Variedades

      </h1>

      <div className="space-y-4">

        {variedades.map(
          (variedad) => (

            <div

              key={variedad.id}

              className="
                bg-white
                rounded-3xl
                p-5
                shadow-lg
                flex
                gap-4
                items-center
              "
            >

              <img

                src={

                  variedad.imagen_url ||

                  'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200'

                }

                className="
                  w-24
                  h-24
                  object-cover
                  rounded-2xl
                "

              />

              <div className="flex-1">

                <h2
                  className="
                    text-2xl
                    font-black
                  "
                >

                  {variedad.nombre}

                </h2>

                <p
                  className="
                    text-gray-500
                  "
                >

                  {
                    variedad
                      .productos_base
                      ?.nombre
                  }

                </p>

              </div>

              <button
                className="
                  bg-black
                  text-white
                  px-5
                  py-3
                  rounded-2xl
                  font-bold
                "
              >

                Generar IA

              </button>

            </div>

          )
        )}

      </div>

    </main>

  )

}