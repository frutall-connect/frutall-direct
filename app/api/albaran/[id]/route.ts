import { NextResponse } from 'next/server'
import { Readable } from 'node:stream'
import React from 'react'
import { renderToStream } from '@react-pdf/renderer'
import { createClient } from '@supabase/supabase-js'

import AlbaranPDF from '@/components/pdf/AlbaranPDF'

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { 'Cache-Control': 'private, no-store' } }
  )
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const accessToken = request.headers
    .get('authorization')
    ?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (!accessToken) {
    return errorResponse('Autenticación requerida', 401)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    console.error('La configuración de albaranes está incompleta')
    return errorResponse('No se pudo generar el albarán', 500)
  }

  try {
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { data: authData, error: authError } =
      await authClient.auth.getUser(accessToken)

    if (authError) {
      if (authError.status === 400 || authError.status === 401 || authError.status === 403) {
        return errorResponse('Autenticación no válida', 401)
      }

      console.error('Error al verificar la autenticación del albarán:', authError)
      return errorResponse('No se pudo verificar la autenticación', 503)
    }

    if (!authData.user) {
      return errorResponse('Autenticación no válida', 401)
    }

    const { id } = await context.params
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        lineas_pedido (*)
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Error al consultar el pedido para el albarán:', error)
      return errorResponse('No se pudo consultar el pedido', 500)
    }

    if (!pedido) {
      return errorResponse('Pedido no encontrado', 404)
    }

    if (pedido.usuario_id !== authData.user.id) {
      return errorResponse('No tienes permiso para acceder a este pedido', 403)
    }

    const stream = await renderToStream(
      React.createElement(AlbaranPDF, { pedido })
    )

    if (!(stream instanceof Readable)) {
      throw new Error('El generador de PDF no devolvió un flujo válido')
    }

    const iterator = stream[Symbol.asyncIterator]()
    const body = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { value, done } = await iterator.next()
          if (done) {
            controller.close()
          } else if (value instanceof Uint8Array) {
            controller.enqueue(value)
          } else if (typeof value === 'string') {
            controller.enqueue(new TextEncoder().encode(value))
          } else {
            throw new Error('El generador de PDF devolvió datos no válidos')
          }
        } catch (error) {
          stream.destroy()
          controller.error(error)
        }
      },
      cancel() {
        stream.destroy()
      }
    })

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="albaran-${pedido.id}.pdf"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  } catch (error) {
    console.error('Error al generar el albarán:', error)
    return errorResponse('No se pudo generar el albarán', 500)
  }
}
