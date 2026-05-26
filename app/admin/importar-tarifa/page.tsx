'use client'

import {

  useState

} from 'react'

import {

  supabase

} from '@/lib/supabaseClient'

export default function ImportarTarifaPage() {

  const [texto, setTexto] =
    useState('')

  const [resultado, setResultado] =
    useState<any[]>([])

  async function procesar() {

    const lineas =
      texto.split('\n')

    const encontrados: any[] = []

    for (const linea of lineas) {

      const limpia =
        linea.toLowerCase()

      const { data } =
        await supabase

          .from(
            'variedades_producto'
          )

          .select('*')

      const match =
        data?.find((v) =>

          limpia.includes(
            v.nombre.toLowerCase()
          )

        )

      const precioMatch =
        linea.match(
          /(\d+[.,]\d{1,2})/
        )

      encontrados.push({

        linea,

        variedad:
          match?.nombre || null,

        precio:
          precioMatch?.[1] || null

      })

    }

    setResultado(
      encontrados
    )

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

        Importar tarifa

      </h1>

      <textarea

        value={texto}

        onChange={(e) =>

          setTexto(
            e.target.value
          )

        }

        placeholder="
Pega aquí la tarifa proveedor

Ejemplo:

RAF 5KG C22 16,90
KUMATO 6KG 18,40
"

        className="
          w-full
          h-64
          rounded-3xl
          p-5
          bg-white
          shadow-lg
        "

      />

      <button

        onClick={procesar}

        className="
          mt-5
          w-full
          bg-green-700
          text-white
          rounded-3xl
          py-4
          font-black
          text-xl
        "

      >

        Procesar tarifa

      </button>

      <div className="mt-8 space-y-4">

        {resultado.map(
          (item, index) => (

            <div

              key={index}

              className="
                bg-white
                rounded-3xl
                p-5
                shadow-lg
              "
            >

              <p
                className="
                  font-bold
                "
              >

                {item.linea}

              </p>

              <p className="mt-2">

                🌱 Variedad:
                {' '}
                {
                  item.variedad ||
                  'No detectada'
                }

              </p>

              <p>

                💰 Precio:
                {' '}
                {
                  item.precio ||
                  'No detectado'
                }

              </p>

            </div>

          )
        )}

      </div>

    </main>

  )

}