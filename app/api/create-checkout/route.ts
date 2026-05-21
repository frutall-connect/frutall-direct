import { NextResponse }
  from 'next/server'

import Stripe from 'stripe'

export async function POST(
  request: Request
) {

  try {

    const stripe = new Stripe(

      process.env.STRIPE_SECRET_KEY!,

      {
        apiVersion:
          '2026-04-22.dahlia'
      }

    )

    const body =
      await request.json()

    const items =
      body.items || []

    const session =
      await stripe.checkout.sessions.create({

        payment_method_types: [

          'card',

          'link'

        ],

        line_items:

          items.map((item: any) => ({

            price_data: {

              currency: 'eur',

              product_data: {

                name:
                  item.nombre

              },

              unit_amount:
                Math.round(
                  item.precio * 100
                )

            },

            quantity:
              item.cantidad

          })),

        mode: 'payment',

        success_url:
          `${request.headers.get(
            'origin'
          )}/pedido-exito`,

        cancel_url:
          `${request.headers.get(
            'origin'
          )}/carrito`

      })

    return NextResponse.json({

      url: session.url

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(

      {
        error:
          'Error creando checkout'
      },

      {
        status: 500
      }

    )

  }

}