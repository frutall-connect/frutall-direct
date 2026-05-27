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

    texto

      .split('\n')

      .map(
        (l) => l.trim()
      )

      .filter(Boolean)

  const encontrados: any[] = []

  const { data: variedades } =
    await supabase

      .from(
        'variedades_producto'
      )

      .select('*')

const variedadesOrdenadas =

  variedades?.sort(

    (a, b) =>

      b.nombre.length -
      a.nombre.length

  )

const { data: aliases } =

  await supabase

    .from(
      'aliases_producto'
    )

    .select(`
      alias,
      variedad_id
    `)

const { data: formatos } =
  await supabase

    .from(
      'formatos_producto'
    )

    .select('*')

  for (let i = 0; i < lineas.length; i++) {

    const linea =
      lineas[i]

    const limpia =
      linea.toLowerCase()

    const precioMatch =

      linea.match(
        /(\d+[.,]\d{1,2})/
      )

    if (!precioMatch) continue

    const precio =
      precioMatch[1]

    const posibleProducto =

  linea
    .replace(
      /(\d+[.,]\d{1,2})/,
      ''
    )
    .trim()

    let match =
  variedades?.find((v) => {

    const textoNormalizado =

      posibleProducto

        .toLowerCase()

        .replace(/\s+/g, ' ')

        .trim()

    const variedadNormalizada =

      v.nombre

        .toLowerCase()

        .replace(/\s+/g, ' ')

        .trim()

    return textoNormalizado.includes(
      variedadNormalizada
    )

  })

if (!match) {

  const textoNormalizado =

    posibleProducto

      .toLowerCase()

      .replace(/\s+/g, ' ')

      .trim()

  const palabras =

  textoNormalizado.split(' ')

const aliasEncontrado =

  aliases?.find((a) => {

    const aliasNormalizado =

      a.alias

        .toLowerCase()

        .replace(/\s+/g, ' ')

        .trim()

    return palabras.includes(
      aliasNormalizado
    )

const formatoEncontrado =

  formatos?.find((f) => {

    const formatoNormalizado =

      f.nombre

        .toLowerCase()

        .replace(/\s+/g, ' ')

        .trim()

    return textoNormalizado.includes(
      formatoNormalizado
    )

  })

encontrados.push({

  producto:
    posibleProducto,

  variedad:
    match?.nombre || null,

  precio,

  formato:
    formatoEncontrado?.nombre || null,

  })

  if (aliasEncontrado) {

    match =
  variedadesOrdenadas?.find(

    (v) =>

      String(v.id).trim() ===
      String(
        aliasEncontrado.variedad_id
      ).trim()

  )

  }

}

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
<p>

  📦 Formato:
  {' '}

  {
    item.formato ||
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