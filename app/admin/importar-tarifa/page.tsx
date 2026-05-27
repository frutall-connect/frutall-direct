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

async function guardarTarifa() {

  for (const item of resultado) {

    if (
      !item.variedad ||
      !item.precio
    ) continue

    await supabase

      .from(
        'tarifas_proveedor'
      )

      .insert({

        referencia_id: null,

        proveedor:
          'IMPORTACIÓN MANUAL',

        precio_compra:
          Number(
            item.precio.replace(',', '.')
          ),

        fecha:
          new Date(),

        observaciones:
          JSON.stringify(item)

      })

await supabase

  .from(
    'productos'
  )

  .insert({

nombre:
  item.producto ||
  item.variedad,

    descripcion:
      JSON.stringify(item),

    precio:
      Number(
        item.precio.replace(',', '.')
      ),

    categoria:
      'Frutas y Verduras',

    imagen:
      'https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=1200&auto=format&fit=crop',

    disponible:
      true

  })
  }

  alert(
    'Tarifas guardadas'
  )

}

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

const { data: calibres } =
  await supabase

    .from(
      'calibres_producto'
    )

    .select('*')

  const variedadesOrdenadas =

    variedades?.sort(

      (a, b) =>

        b.nombre.length -
        a.nombre.length

    )

  for (let i = 0; i < lineas.length; i++) {

    const linea =
      lineas[i]

    const precioMatch =

      linea.match(
        /(\d+[.,]\d{1,2})/
      )

    if (!precioMatch) continue

    const precio =
      precioMatch[1]

    let posibleProducto =

  linea

    .replace(
      /(\d+[.,]\d{1,2})/,
      ''
    )

    .trim()

if (!posibleProducto) {

  posibleProducto =
    lineas[i - 1] || ''

}

    const textoNormalizado =

      posibleProducto

        .toLowerCase()

        .replace(/\s+/g, ' ')

        .trim()

    let match =

      variedadesOrdenadas?.find((v) => {

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

    const formatosOrdenados =

  formatos?.sort(

    (a, b) =>

      b.nombre.length -
      a.nombre.length

  )

const formatoEncontrado =

  formatosOrdenados?.find((f) => {

    const formatoNormalizado =

      f.nombre

        .toLowerCase()

        .replace(/\s+/g, ' ')

        .trim()

    return textoNormalizado.includes(
      formatoNormalizado
    )

  })

const palabras =

  textoNormalizado
    .split(' ')

const calibreEncontrado =

  calibres?.find((c) => {

    const calibreNormalizado =

      c.nombre

        .toLowerCase()

        .replace(/\s+/g, ' ')

        .trim()

    return palabras.includes(
      calibreNormalizado
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

calibre:
  calibreEncontrado?.nombre || null,

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

<button

  onClick={guardarTarifa}

  className="
    mt-4
    w-full
    bg-black
    text-white
    rounded-3xl
    py-4
    font-black
    text-xl
  "

>

  Guardar tarifas

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

<p>

  📏 Calibre:
  {' '}

  {
    item.calibre ||
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