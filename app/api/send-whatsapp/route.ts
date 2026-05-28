import { NextResponse }
  from 'next/server'

import twilio from 'twilio'

const client = twilio(

  process.env.TWILIO_ACCOUNT_SID,

  process.env.TWILIO_AUTH_TOKEN

)

export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json()

    const mensaje = `

🛒 NUEVO PEDIDO

Pedido #${body.pedidoId}

💶 Total:
${body.total.toFixed(2)} €

💳 Método:
${body.metodoPago}

📦 Estado:
Pendiente

`console.log(
  'FROM:',
  process.env.TWILIO_WHATSAPP_FROM
)

console.log(
  'TO:',
  process.env.ADMIN_WHATSAPP
)

    const response =
      await client.messages.create({

        from:
  process.env
    .TWILIO_WHATSAPP_FROM || '',

        to:
  process.env
    .ADMIN_WHATSAPP || '',

        body:
          mensaje

      })

    return NextResponse.json({

      ok: true,

      sid: response.sid

    })

  } catch (error: any) {

    console.error(error)

    return NextResponse.json({

      ok: false,

      error:
        error.message

    })

  }

}