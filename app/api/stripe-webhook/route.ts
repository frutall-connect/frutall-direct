import Stripe from 'stripe'

import { headers }
  from 'next/headers'

import { createClient }
  from '@supabase/supabase-js'

const stripe = new Stripe(

  process.env.STRIPE_SECRET_KEY || '',

  {
    apiVersion:
      '2026-04-22.dahlia'
  }

)

export async function POST(
  request: Request
) {

  try {

    const body =
      await request.text()

    const signature =
      (await headers()).get(
        'stripe-signature'
      ) || ''

    const event =
      stripe.webhooks.constructEvent(

        body,

        signature,

        process.env
          .STRIPE_WEBHOOK_SECRET || ''

      )

    if (
      event.type ===
      'checkout.session.completed'
    ) {

      const session =
        event.data.object

      const supabase =
        createClient(

          process.env
            .NEXT_PUBLIC_SUPABASE_URL || '',

          process.env
            .SUPABASE_SERVICE_ROLE_KEY || ''

        )

      await supabase

        .from('pedidos')

        .update({

          pagado: true,

          estado: 'pagado'

        })

        .eq(
          'stripe_session_id',
          session.id
        )

    }

    return new Response(

      JSON.stringify({

        received: true

      }),

      {
        status: 200
      }

    )

  } catch (error: any) {

    console.error(error)

    return new Response(

      `Webhook Error: ${error.message}`,

      {
        status: 400
      }

    )

  }

}