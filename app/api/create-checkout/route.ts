import { NextResponse }
  from 'next/server'

import Stripe from 'stripe'

import { createClient }
  from '@supabase/supabase-js'

export async function POST(
  request: Request
) {

  try {

    const stripe = new Stripe(

      process.env.STRIPE_SECRET_KEY || '',

      {
        apiVersion:
          '2026-04-22.dahlia'
      }

    )

    const supabase =
      createClient(

        process.env
          .NEXT_PUBLIC_SUPABASE_URL || '',

        process.env
          .SUPABASE_SERVICE_ROLE_KEY || ''

      )

    const body =
      await request.json()

    const items =
      body.items || []

    const pedidoId =
      body.pedidoId

    const session =
      await stripe.checkout.sessions.create({

        payment_method_types: [

          'card'

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
                  Number(item.precio) * 100
                )

            },

            quantity:
              Number(item.cantidad)

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

    if (pedidoId) {

      await supabase

        .from('pedidos')

        .update({

          stripe_session_id:
            session.id

        })

        .eq('id', pedidoId)

    }

    return NextResponse.json({

      url: session.url

    })

  } catch (error: any) {

    console.error(error)

    return NextResponse.json({

      ok: false,

      error:
        error?.message ||

        'Stripe error'

    })

  }

}