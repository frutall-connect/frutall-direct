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

const [proveedor, setProveedor] =
  useState('')

const [fechaTarifa, setFechaTarifa] =
  useState('')

async function guardarTarifa() {
  try {
    if (!proveedor.trim()) {
      alert('Indica el proveedor de la tarifa.')
      return
    }

    if (!fechaTarifa) {
      alert('Indica la fecha de la tarifa.')
      return
    }

    const lineasValidas = resultado.filter((item) => {
      const precio = Number(item.precio.replace(',', '.'))

      return (
        item.motivos_revision.length === 0 &&
        Boolean(item.producto_base_id) &&
        Boolean(item.variedad_id) &&
        Boolean(item.formato_id) &&
        Number.isFinite(precio) &&
        precio > 0 &&
        !item.texto_no_resuelto
      )
    })

    if (lineasValidas.length === 0) {
      alert('No hay líneas válidas para guardar.')
      return
    }

    let guardadas = 0

    for (const item of lineasValidas) {
      const precio = Number(item.precio.replace(',', '.'))

      let consultaReferencia = supabase
        .from('referencias_producto')
        .select('id')
        .eq('variedad_id', item.variedad_id)
        .eq('formato_id', Number(item.formato_id))

      if (item.calibre_id) {
        consultaReferencia = consultaReferencia.eq(
          'calibre_id',
          Number(item.calibre_id)
        )
      } else {
        consultaReferencia = consultaReferencia.is(
          'calibre_id',
          null
        )
      }

      let { data: referencia, error } =
        await consultaReferencia.maybeSingle()

      if (error) {
        throw error
      }

      if (!referencia) {
        const { data: nuevaReferencia, error: errorNuevaReferencia } =
          await supabase
            .from('referencias_producto')
            .insert({
              variedad_id: item.variedad_id,
              formato_id: Number(item.formato_id),
              calibre_id: item.calibre_id
                ? Number(item.calibre_id)
                : null,
              sku: [
                item.producto,
                item.variedad,
                item.formato,
                item.calibre,
              ]
                .filter(Boolean)
                .join('-')
                .toUpperCase()
                .replace(/\s+/g, '-'),
              activo: true,
            })
            .select('id')
            .single()

        if (errorNuevaReferencia) {
          throw errorNuevaReferencia
        }

        referencia = nuevaReferencia
      }

      const { error: errorTarifa } = await supabase
        .from('tarifas_proveedor')
        .insert({
          referencia_id: referencia.id,
          proveedor: proveedor.trim(),
          precio_compra: precio,
          fecha: fechaTarifa,
          observaciones: item.observaciones,
        })

      if (errorTarifa) {
        throw errorTarifa
      }

      guardadas += 1
    }

    alert(
      `Importación completada. Líneas guardadas: ${guardadas}.`
    )
  } catch (error) {
  console.error('Error al guardar la tarifa:', error)

  alert(
    `Error al guardar la tarifa:\n\n${JSON.stringify(error, null, 2)}`
  )
}
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
  !resultado.some((item) => {
    const precio = Number(item.precio.replace(',', '.'))

    return (
      item.motivos_revision.length === 0 &&
      Boolean(item.producto_base_id) &&
      Boolean(item.variedad_id) &&
      Number.isFinite(precio) &&
      precio > 0 &&
      !item.texto_no_resuelto
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

<input
  type="text"
  value={proveedor}
  onChange={(e) => setProveedor(e.target.value)}
  placeholder="Proveedor de la tarifa"
  className="
    w-full
    rounded-3xl
    p-5
    mb-4
    bg-white
    shadow-lg
  "
/>

<input
  type="date"
  value={fechaTarifa}
  onChange={(e) => setFechaTarifa(e.target.value)}
  className="
    w-full
    rounded-3xl
    p-5
    mb-4
    bg-white
    shadow-lg
  "
/>

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