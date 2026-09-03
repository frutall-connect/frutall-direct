'use client'

import {

  useState

} from 'react'

import {

  supabase

} from '@/lib/supabaseClient'

import AdminGuard
  from '@/components/auth/AdminGuard'

type CatalogItem = {
  id: string
  nombre: string
  producto_base_id?: string | null
}

type AliasItem = {
  alias: string
  variedad_id: string
}

type TarifaPreview = {
  linea_original: string
  producto: string | null
  variedad: string | null
  precio: string
  formato: string | null
  calibre: string | null
  caracteristicas_comerciales: string[]
  requiere_revision: boolean
}

const COMMERCIAL_FEATURES = [
  'caja azul',
  'sello azul',
  'florette',
  'caja',
  'malla',
  'saco',
  'extra',
]

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function catalogNameVariants(value: string) {
  const normalized = normalizeText(value)
  const variants = new Set([normalized])

  if (normalized.endsWith('ones')) {
    variants.add(`${normalized.slice(0, -4)}on`)
  } else if (normalized.endsWith('s')) {
    variants.add(normalized.slice(0, -1))
  }

  return [...variants]
}

function matchesCatalogItem(value: string, item: CatalogItem) {
  const normalizedValue = ` ${normalizeText(value)} `

  return catalogNameVariants(item.nombre).some((variant) =>
    normalizedValue.includes(` ${variant} `)
  )
}

function findCatalogItems(value: string, items: CatalogItem[]) {
  return [...items]
    .filter((item) => item.nombre)
    .sort((a, b) => b.nombre.length - a.nombre.length)
    .filter((item) => matchesCatalogItem(value, item))
}

function findCatalogItem(value: string, items: CatalogItem[]) {
  return findCatalogItems(value, items)[0] || null
}

function removeCatalogItem(value: string, item: CatalogItem | null) {
  if (!item) return value

  const normalizedValue = normalizeText(value)
  const matchedName = catalogNameVariants(item.nombre).find((variant) =>
    ` ${normalizedValue} `.includes(` ${variant} `)
  )

  if (!matchedName) return normalizedValue

  const escapedName = matchedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return normalizedValue
    .replace(new RegExp(`(^|\\s)${escapedName}(?=\\s|$)`, 'i'), ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCase(value: string) {
  return value.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase())
}

export default function ImportarTarifaPage() {

  const [texto, setTexto] =
    useState('')

  const [resultado, setResultado] =
    useState<TarifaPreview[]>([])

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

    const lineas = texto
      .split('\n')
      .map((linea) => linea.trim())
      .filter(Boolean)

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

    const productos = (productosBase || []) as CatalogItem[]
    const catalogoVariedades = (variedades || []) as CatalogItem[]
    const catalogoFormatos = (formatos || []) as CatalogItem[]
    const catalogoCalibres = (calibres || []) as CatalogItem[]
    const catalogoAliases = (aliases || []) as AliasItem[]
    const resultados: TarifaPreview[] = []

    for (let index = 0; index < lineas.length; index++) {
      const lineaConPrecio = lineas[index]
      const precioMatch = lineaConPrecio.match(/(\d+[.,]\d{1,2})/)

      if (!precioMatch) continue

      const anterior = lineas[index - 1]
      const productoEnLinea = findCatalogItem(lineaConPrecio, productos)
      const productoEnAnterior = anterior
        ? findCatalogItem(anterior, productos)
        : null
      const lineaOriginal = anterior &&
        !/(\d+[.,]\d{1,2})/.test(anterior) &&
        !productoEnLinea &&
        productoEnAnterior
        ? `${anterior}\n${lineaConPrecio}`
        : lineaConPrecio

      const textoSinPrecio = lineaOriginal
        .replace(/(\d+[.,]\d{1,2})/, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      const productosDetectados = findCatalogItems(textoSinPrecio, productos)
      const producto = productosDetectados[0] || null
      let textoRestante = removeCatalogItem(textoSinPrecio, producto)

      const variedadesDelProducto = producto
        ? catalogoVariedades.filter(
            (item) => String(item.producto_base_id) === String(producto.id)
          )
        : []
      const variedadesDetectadas = findCatalogItems(
        textoRestante,
        variedadesDelProducto
      )
      let variedad: CatalogItem | null =
        variedadesDetectadas[0] || null

      if (!variedad) {
        const alias = catalogoAliases.find((item) =>
          normalizeText(textoRestante).includes(normalizeText(item.alias))
        )

        variedad = alias
          ? variedadesDelProducto.find(
              (item) => String(item.id) === String(alias.variedad_id)
            ) || null
          : null
      }

      textoRestante = removeCatalogItem(textoRestante, variedad)

      const formato = findCatalogItem(textoRestante, catalogoFormatos)
      textoRestante = removeCatalogItem(textoRestante, formato)

      const calibre = findCatalogItem(textoRestante, catalogoCalibres)
      textoRestante = removeCatalogItem(textoRestante, calibre)

      const caracteristicas: string[] = []
      let textoCaracteristicas = normalizeText(textoRestante)

      for (const feature of COMMERCIAL_FEATURES) {
        if (textoCaracteristicas.includes(feature)) {
          caracteristicas.push(titleCase(feature))
          textoCaracteristicas = textoCaracteristicas.replace(feature, ' ')
        }
      }

      const textoSinCaracteristicas = textoCaracteristicas
        .replace(/\s+/g, ' ')
        .trim()
      const variedadPendiente = !variedad &&
        caracteristicas.length > 0

      resultados.push({
        linea_original: lineaOriginal,
        producto: producto?.nombre || null,
        variedad: variedad?.nombre || null,
        precio: precioMatch[1].replace(',', '.'),
        formato: formato?.nombre || null,
        calibre: calibre?.nombre || null,
        caracteristicas_comerciales: caracteristicas,
        requiere_revision:
          !producto ||
          productosDetectados.length > 1 ||
          variedadesDetectadas.length > 1 ||
          variedadPendiente ||
          Boolean(textoSinCaracteristicas),
      })
    }

    setResultado(resultados)
  }

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

{item.requiere_revision && (

  <p className="mt-2 font-bold text-amber-700">

    Requiere revisión antes de guardar

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