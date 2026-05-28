import { NextResponse }
  from 'next/server'

import React from 'react'

import {
  renderToStream
} from '@react-pdf/renderer'

import AlbaranPDF
  from '@/components/pdf/AlbaranPDF'

import QRCode
  from 'qrcode'

import fs from 'fs'

import path from 'path'

import { createClient }
  from '@supabase/supabase-js'

const supabase = createClient(

  process.env
    .NEXT_PUBLIC_SUPABASE_URL || '',

  process.env
    .SUPABASE_SERVICE_ROLE_KEY || ''

)

export async function GET(

  request: Request,

  context: {
    params: Promise<{
      id: string
    }>
  }

) {

  const params =
    await context.params
  try {

    const pedidoId =
      params.id

    // ===== PEDIDO =====

    const {
      data: pedido
    } = await supabase

      .from('pedidos')

      .select(`
        *,
        lineas_pedido (*)
      `)

      .eq('id', pedidoId)

      .single()

    if (!pedido) {

      return NextResponse.json({

        error:
          'Pedido no encontrado'

      })

    }

    const stream = await renderToStream(

  React.createElement(
    AlbaranPDF,
    { pedido }
  )

)

return new NextResponse(
  stream as any,
  {
    headers: {
      'Content-Type':
        'application/pdf',

      'Content-Disposition':

        `inline; filename="albaran-${pedido.id}.pdf"`
    }
  }
)

  } catch (error: any) {

    console.error(error)

    return NextResponse.json({

      error:
        error.message

    })

  }

}