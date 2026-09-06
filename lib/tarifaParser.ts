export type CatalogItem = {
  id: string
  nombre: string
  producto_base_id?: string | null
}

export type AliasItem = {
  alias: string
  variedad_id: string
}

export type TarifaPreview = {
  linea_original: string
  texto_no_resuelto: string
  producto_base_id: string | null
  producto: string | null
  variedad_id: string | null
  variedad: string | null
  formato_id: string | null
  formato: string | null
  calibre_id: string | null
  calibre: string | null
  referencia_id: string | null
  precio: string
  caracteristicas_comerciales: string[]
  motivos_revision: string[]
  observaciones: string
}

export type CatalogosTarifa = {
  productosBase: CatalogItem[]
  variedades: CatalogItem[]
  aliases: AliasItem[]
  formatos: CatalogItem[]
  calibres: CatalogItem[]
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

const BLOCKING_COMMERCIAL_FEATURES = [
  'extra',
  'sello azul',
  'florette',
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

export function parseTarifa(
  texto: string,
  catalogos: CatalogosTarifa
): TarifaPreview[] {
  const lineas = texto
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean)

  const resultados: TarifaPreview[] = []

  for (let index = 0; index < lineas.length; index++) {
    const lineaConPrecio = lineas[index]
    const precioMatch = lineaConPrecio.match(/(\d+[.,]\d{1,2})/)

    if (!precioMatch) continue

    const anterior = lineas[index - 1]
    const productoEnLinea = findCatalogItem(lineaConPrecio, catalogos.productosBase)
    const productoEnAnterior = anterior
      ? findCatalogItem(anterior, catalogos.productosBase)
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

    const productosDetectados = findCatalogItems(
      textoSinPrecio,
      catalogos.productosBase
    )
    const producto = productosDetectados[0] || null
    let textoRestante = removeCatalogItem(textoSinPrecio, producto)

    const variedadesDelProducto = producto
      ? catalogos.variedades.filter(
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
      const alias = catalogos.aliases.find((item) =>
        normalizeText(textoRestante).includes(normalizeText(item.alias))
      )

      variedad = alias
        ? variedadesDelProducto.find(
            (item) => String(item.id) === String(alias.variedad_id)
          ) || null
        : null
    }

    textoRestante = removeCatalogItem(textoRestante, variedad)

    const formatosDetectados = findCatalogItems(
      textoRestante,
      catalogos.formatos
    )
    const formato = formatosDetectados[0] || null
    textoRestante = removeCatalogItem(textoRestante, formato)

    const calibresDetectados = findCatalogItems(
      textoRestante,
      catalogos.calibres
    )
    const calibre = calibresDetectados[0] || null
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
    const precio = Number(precioMatch[1].replace(',', '.'))
    const motivosRevision: string[] = []

    if (!producto) {
      motivosRevision.push('Producto base no detectado')
    }

    if (productosDetectados.length > 1) {
      motivosRevision.push('Producto base ambiguo')
    }

    if (!variedad) {
      motivosRevision.push('Variedad no detectada')
    }

    if (variedadesDetectadas.length > 1) {
      motivosRevision.push('Variedad ambigua')
    }

    if (!formato) {
  motivosRevision.push('Formato pendiente de validar para esta referencia')
}

if (formatosDetectados.length > 1) {
  motivosRevision.push('Formato ambiguo')
}

if (calibresDetectados.length > 1) {
  motivosRevision.push('Calibre ambiguo')
}

    if (!Number.isFinite(precio) || precio <= 0) {
      motivosRevision.push('Precio no valido')
    }

    for (const feature of caracteristicas) {
      if (BLOCKING_COMMERCIAL_FEATURES.includes(normalizeText(feature))) {
        motivosRevision.push(
          `Caracteristica comercial sin modelar: ${feature}`
        )
      }
    }

    if (textoSinCaracteristicas) {
      motivosRevision.push('Texto sin resolver')
    }

    // No se asigna una referencia sin resolverla contra referencias_producto.

    const observaciones = JSON.stringify({
      linea_original: lineaOriginal,
      texto_no_resuelto: textoSinCaracteristicas,
      producto_base_id: producto?.id || null,
      producto: producto?.nombre || null,
      variedad_id: variedad?.id || null,
      variedad: variedad?.nombre || null,
      formato_id: formato?.id || null,
      formato: formato?.nombre || null,
      calibre_id: calibre?.id || null,
      calibre: calibre?.nombre || null,
      caracteristicas_comerciales: caracteristicas,
      version_parser: 1,
    })

    resultados.push({
      linea_original: lineaOriginal,
      texto_no_resuelto: textoSinCaracteristicas,
      producto_base_id: producto?.id || null,
      producto: producto?.nombre || null,
      variedad_id: variedad?.id || null,
      variedad: variedad?.nombre || null,
      formato_id: formato?.id || null,
      formato: formato?.nombre || null,
      calibre_id: calibre?.id || null,
      calibre: calibre?.nombre || null,
      referencia_id: null,
      precio: precioMatch[1].replace(',', '.'),
      caracteristicas_comerciales: caracteristicas,
      motivos_revision: motivosRevision,
      observaciones,
    })
  }

  return resultados
}
