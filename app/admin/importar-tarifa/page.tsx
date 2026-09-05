'use client'

import {

  useState

} from 'react'

import {

  supabase

} from '@/lib/supabaseClient'

import {

  parseTarifa,
  type AliasItem,
  type CatalogItem,
  type TarifaPreview,

} from '@/lib/tarifaParser'

import AdminGuard
  from '@/components/auth/AdminGuard'

export default function ImportarTarifaPage() {

  const [texto, setTexto] =
    useState('')

  const [resultado, setResultado] =
    useState<TarifaPreview[]>([])

async function guardarTarifa() {
  alert(
    'La persistencia de tarifas esta pendiente de la RPC de importacion.'
  )

}

  async function procesar() {

    const [
      { data: productosBase },
      { data: variedades },
      { data: aliases },
      { data: formatos },
      { data: calibres },
    ] = await Promise.all([
      supabase.from('productos_base').select('id, nombre'),
      supabase.from('variedades_producto').select('id, nombre, producto_base_id'),
      supabase.from('aliases_producto').select('alias, variedad_id'),
      supabase.from('formatos_producto').select('id, nombre'),
      supabase.from('calibres_producto').select('id, nombre'),
    ])

    setResultado(
      parseTarifa(texto, {
        productosBase: (productosBase || []) as CatalogItem[],
        variedades: (variedades || []) as CatalogItem[],
        aliases: (aliases || []) as AliasItem[],
        formatos: (formatos || []) as CatalogItem[],
        calibres: (calibres || []) as CatalogItem[],
      })
    )
  }

  const guardarDeshabilitado =
  resultado.length === 0 ||
  resultado.some((item) => {
    const precio = Number(item.precio.replace(',', '.'))

    return (
      item.motivos_revision.length > 0 ||
      !item.producto_base_id ||
      !item.variedad_id ||
      !Number.isFinite(precio) ||
      precio <= 0 ||
      Boolean(item.texto_no_resuelto)
    )
  })

  return (

    <AdminGuard
      allow={[
        'admin'
      ]}
    >

    <main
      className="
        min-h-screen
        bg-white
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
  disabled={guardarDeshabilitado}

  className="
    mt-4
    w-full
    bg-black
    text-white
    rounded-3xl
    py-4
    font-black
    text-xl
    disabled:cursor-not-allowed
    disabled:opacity-40
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

                Línea original: {item.linea_original}

              </p>

              <p className="mt-2">

                🍅 Producto:
                {' '}
                {item.producto || 'Pendiente de revisión'}

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

<p>

  🏷️ Características:
  {' '}

  {
    item.caracteristicas_comerciales.length > 0
      ? item.caracteristicas_comerciales.join(', ')
      : 'Ninguna detectada'
  }

</p>

{item.motivos_revision.length > 0 && (

  <p className="mt-2 font-bold text-amber-700">

    Requiere revisión antes de guardar: {' '}
    {item.motivos_revision.join(', ')}

  </p>

)}

            </div>

          )
        )}

      </div>

    </main>

    </AdminGuard>

  )

}