import { NextResponse }
  from 'next/server'

import { PDFDocument }
  from 'pdf-lib'

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

  {
    params
  }: {
    params: {
      id: string
    }
  }

) {

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

    // ===== PDF =====

    const pdfDoc =
      await PDFDocument.create()

    const page =
      pdfDoc.addPage([595, 842])

    const {
      width,
      height
    } = page.getSize()

    // ===== LOGO =====

    const logoPath = path.join(

      process.cwd(),

      'public/pdf/logo.png'

    )

    const logoBytes =
      fs.readFileSync(logoPath)

    const logoImage =
      await pdfDoc.embedPng(
        logoBytes
      )

    page.drawImage(

      logoImage,

      {

        x: 40,

        y: height - 120,

        width: 220,

        height: 70

      }

    )

    // ===== TITULO =====

    page.drawText(

      'ALBARÁN DE ENTREGA',

      {

        x: 320,

        y: height - 70,

        size: 22

      }

    )

    // ===== PEDIDO =====

    page.drawText(

      `Pedido #${pedido.id}`,

      {

        x: 320,

        y: height - 110,

        size: 16

      }

    )

    // ===== QR =====

    const qrUrl =

      `${request.headers.get(
        'origin'
      )}/pedidos`

    const qrDataUrl =
      await QRCode.toDataURL(qrUrl)

    const qrBase64 =
      qrDataUrl.split(',')[1]

    const qrImage =
      await pdfDoc.embedPng(

        Buffer.from(
          qrBase64,
          'base64'
        )

      )

    page.drawImage(

      qrImage,

      {

        x: 40,

        y: height - 260,

        width: 90,

        height: 90

      }

    )

    // ===== CLIENTE =====

    page.drawText(

      'CLIENTE',

      {

        x: 40,

        y: height - 300,

        size: 18

      }

    )

    page.drawText(

      pedido.usuario_id,

      {

        x: 40,

        y: height - 325,

        size: 12

      }

    )

    // ===== ESTADO =====

    page.drawText(

      `Estado: ${pedido.estado}`,

      {

        x: 320,

        y: height - 160,

        size: 14

      }

    )

    // ===== PRODUCTOS =====

    let y = height - 400

    page.drawText(

      'PRODUCTOS',

      {

        x: 40,

        y,

        size: 18

      }

    )

    y -= 30

    pedido.lineas_pedido?.forEach(

      (linea: any) => {

        page.drawText(

          `${linea.nombre_producto}`,

          {

            x: 40,

            y,

            size: 12

          }

        )

        page.drawText(

          `x${linea.cantidad}`,

          {

            x: 300,

            y,

            size: 12

          }

        )

        page.drawText(

          `${linea.subtotal.toFixed(2)} €`,

          {

            x: 420,

            y,

            size: 12

          }

        )

        y -= 25

      }

    )

    // ===== TOTAL =====

    y -= 20

    page.drawText(

      `TOTAL: ${pedido.total.toFixed(2)} €`,

      {

        x: 320,

        y,

        size: 22

      }

    )

    // ===== FIRMA =====

    y -= 120

    page.drawText(

      'Firma recepción:',

      {

        x: 40,

        y,

        size: 16

      }

    )

    page.drawLine({

      start: {
        x: 40,
        y: y - 20
      },

      end: {
        x: 260,
        y: y - 20
      },

      thickness: 1

    })

    // ===== PDF FINAL =====

    const pdfBytes =
      await pdfDoc.save()

    return new NextResponse(

      pdfBytes,

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