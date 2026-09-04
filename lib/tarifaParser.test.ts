import { describe, expect, it } from 'vitest'

import {
  parseTarifa,
  type CatalogosTarifa,
  type TarifaPreview,
} from './tarifaParser'

const catalogos: CatalogosTarifa = {
  productosBase: [
    { id: 'producto-aguacate', nombre: 'Aguacate' },
    { id: 'producto-ajo', nombre: 'Ajo' },
    { id: 'producto-naranja', nombre: 'Naranja' },
    { id: 'producto-ensalada', nombre: 'Ensalada' },
    { id: 'producto-sandias', nombre: 'Sandías' },
  ],
  variedades: [
    {
      id: 'variedad-hass',
      nombre: 'Hass',
      producto_base_id: 'producto-aguacate',
    },
    {
      id: 'variedad-chino-morado',
      nombre: 'Chino morado',
      producto_base_id: 'producto-ajo',
    },
    {
      id: 'variedad-zumo',
      nombre: 'Zumo',
      producto_base_id: 'producto-naranja',
    },
    {
      id: 'variedad-mezclum',
      nombre: 'Mezclum',
      producto_base_id: 'producto-ensalada',
    },
    {
      id: 'variedad-rayadas',
      nombre: 'Rayadas',
      producto_base_id: 'producto-sandias',
    },
  ],
  aliases: [],
  formatos: [
    { id: 'formato-malla-6kg', nombre: 'Malla 6kg' },
    { id: 'formato-150gr', nombre: '150 gr' },
  ],
  calibres: [
    { id: 'calibre-c5-c6', nombre: 'C5/C6' },
  ],
}

function obtenerUnResultado(linea: string) {
  const resultados = parseTarifa(linea, catalogos)

  expect(resultados).toHaveLength(1)

  return resultados[0]
}

function esperarLineaBloqueada(resultado: TarifaPreview) {
  expect(resultado.motivos_revision.length).toBeGreaterThan(0)
}

describe('parseTarifa', () => {
  it('detecta Aguacate Hass y bloquea Extra como característica no modelada', () => {
    const resultado = obtenerUnResultado(
      'AGUACATE HASS EXTRA 12,50'
    )

    expect(resultado).toMatchObject({
      producto_base_id: 'producto-aguacate',
      producto: 'Aguacate',
      variedad_id: 'variedad-hass',
      variedad: 'Hass',
      formato_id: null,
      formato: null,
      calibre_id: null,
      calibre: null,
      caracteristicas_comerciales: ['Extra'],
      texto_no_resuelto: '',
      precio: '12.50',
      referencia_id: null,
    })
    expect(resultado.motivos_revision).toEqual(
      expect.arrayContaining([
        'Formato pendiente de validar para esta referencia',
        'Calibre pendiente de validar para esta referencia',
        'Caracteristica comercial sin modelar: Extra',
        'Referencia comercial pendiente de resolver',
      ])
    )
    esperarLineaBloqueada(resultado)
  })

  it('detecta Ajo Chino Morado y el formato Malla 6kg', () => {
    const resultado = obtenerUnResultado(
      'AJO CHINO MORADO MALLA 6KG 12,50'
    )

    expect(resultado).toMatchObject({
      producto_base_id: 'producto-ajo',
      producto: 'Ajo',
      variedad_id: 'variedad-chino-morado',
      variedad: 'Chino morado',
      formato_id: 'formato-malla-6kg',
      formato: 'Malla 6kg',
      calibre_id: null,
      calibre: null,
      caracteristicas_comerciales: [],
      texto_no_resuelto: '',
      precio: '12.50',
      referencia_id: null,
    })
    expect(resultado.motivos_revision).toEqual(
      expect.arrayContaining([
        'Calibre pendiente de validar para esta referencia',
        'Referencia comercial pendiente de resolver',
      ])
    )
    esperarLineaBloqueada(resultado)
  })

  it('detecta Naranja Zumo, C5/C6 y bloquea Sello Azul', () => {
    const resultado = obtenerUnResultado(
      'NARANJA ZUMO C5/C6 SELLO AZUL 12,50'
    )

    expect(resultado).toMatchObject({
      producto_base_id: 'producto-naranja',
      producto: 'Naranja',
      variedad_id: 'variedad-zumo',
      variedad: 'Zumo',
      formato_id: null,
      formato: null,
      calibre_id: 'calibre-c5-c6',
      calibre: 'C5/C6',
      caracteristicas_comerciales: ['Sello Azul'],
      texto_no_resuelto: '',
      precio: '12.50',
      referencia_id: null,
    })
    expect(resultado.motivos_revision).toEqual(
      expect.arrayContaining([
        'Formato pendiente de validar para esta referencia',
        'Caracteristica comercial sin modelar: Sello Azul',
        'Referencia comercial pendiente de resolver',
      ])
    )
    esperarLineaBloqueada(resultado)
  })

  it('detecta Ensalada Mezclum, formato 150 gr y bloquea Florette', () => {
    const resultado = obtenerUnResultado(
      'ENSALADA MEZCLUM 150 GR FLORETTE 12,50'
    )

    expect(resultado).toMatchObject({
      producto_base_id: 'producto-ensalada',
      producto: 'Ensalada',
      variedad_id: 'variedad-mezclum',
      variedad: 'Mezclum',
      formato_id: 'formato-150gr',
      formato: '150 gr',
      calibre_id: null,
      calibre: null,
      caracteristicas_comerciales: ['Florette'],
      texto_no_resuelto: '',
      precio: '12.50',
      referencia_id: null,
    })
    expect(resultado.motivos_revision).toEqual(
      expect.arrayContaining([
        'Calibre pendiente de validar para esta referencia',
        'Caracteristica comercial sin modelar: Florette',
        'Referencia comercial pendiente de resolver',
      ])
    )
    esperarLineaBloqueada(resultado)
  })

  it('documenta S/P como texto no resuelto pendiente de clasificar', () => {
    const resultado = obtenerUnResultado(
      'SANDÍAS RAYADAS S/P 12,50'
    )

    expect(resultado).toMatchObject({
      producto_base_id: 'producto-sandias',
      producto: 'Sandías',
      variedad_id: 'variedad-rayadas',
      variedad: 'Rayadas',
      formato_id: null,
      formato: null,
      calibre_id: null,
      calibre: null,
      caracteristicas_comerciales: [],
      texto_no_resuelto: 's/p',
      precio: '12.50',
      referencia_id: null,
    })
    expect(resultado.motivos_revision).toEqual(
      expect.arrayContaining([
        'Formato pendiente de validar para esta referencia',
        'Calibre pendiente de validar para esta referencia',
        'Texto sin resolver',
        'Referencia comercial pendiente de resolver',
      ])
    )
    esperarLineaBloqueada(resultado)
  })
})
