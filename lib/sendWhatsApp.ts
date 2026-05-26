import twilio from 'twilio'

const client = twilio(

  process.env.TWILIO_ACCOUNT_SID,

  process.env.TWILIO_AUTH_TOKEN

)

export async function sendWhatsApp({

  pedidoId,

  total,

  metodoPago

}: {

  pedidoId: number

  total: number

  metodoPago: string

}) {

  try {

    const mensaje = `

🛒 *NUEVO PEDIDO*

Pedido #${pedidoId}

💶 Total:
${total.toFixed(2)} €

💳 Método:
${metodoPago}

📦 Estado:
Pendiente

`

    const response =
      await client.messages.create({

        from:
          process.env
            .TWILIO_WHATSAPP_FROM,

        to:
          process.env
            .ADMIN_WHATSAPP,

        body:
          mensaje

      })

    console.log(
      'WHATSAPP OK:',
      response.sid
    )

  } catch (error) {

    console.error(
      'WHATSAPP ERROR:',
      error
    )

  }

}