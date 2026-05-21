'use client'

import MobileLayout
  from '@/components/layout/MobileLayout'

import BottomNav
  from '@/components/layout/BottomNav'

import { useCartStore }
  from '@/store/cartStore'

import { supabase }
  from '@/lib/supabaseClient'

export default function CarritoPage() {

  const items = useCartStore(
    (state) => state.items
  )

  const removeItem = useCartStore(
    (state) => state.removeItem
  )

  const clearCart = useCartStore(
    (state) => state.clearCart
  )

  const total = items.reduce(

    (acc, item) =>

      acc + item.precio * item.cantidad,

    0

  )

  async function pagar(
    metodoPago: string
) 

{

    console.log('PAGAR CLICK')
    if (items.length === 0) return

    // ===== USUARIO =====

    const { data: authData } =
      await supabase.auth.getUser()

    const usuario = authData.user

    if (!usuario) {

      alert('Debes iniciar sesión')

      return

    }

    // ===== CREAR PEDIDO =====

    const {

      data: pedidoData,

      error: pedidoError

    } =

      await supabase

        .from('pedidos')

        .insert([{

          usuario_id: usuario.id,

          metodo_pago: metodoPago,

          estado: 'pendiente',

          total

        }])

        .select()

        .single()

    if (pedidoError || !pedidoData) {

      console.error(pedidoError)

      console.log(pedidoError)
      
alert('Error creando pedido')

      return

    }

    // ===== LINEAS =====

    const lineas = items.map(
      (item) => ({

        pedido_id: pedidoData.id,

        producto_id: item.id,

        nombre_producto: item.nombre,

        precio: item.precio,

        cantidad: item.cantidad,

        subtotal:
          item.precio * item.cantidad

      })
    )

    const { error: lineasError } =

      await supabase

        .from('lineas_pedido')

        .insert(lineas)

    if (lineasError) {

      console.error(lineasError)

      alert('Error creando líneas')

      return

    }

    // ===== STRIPE =====

    const response = await fetch(

      '/api/create-checkout',

      {

        method: 'POST',

        headers: {

          'Content-Type':
            'application/json'

        },

        body: JSON.stringify({

          items

        })

      }

    )

    const data =
      await response.json()

console.log(data)
console.log(response.status)

    if (data.url) {

      clearCart()

      window.location.href =
        data.url

    } else {

      alert(
        'Error iniciando pago'
      )

    }

  }

  return (

    <MobileLayout>

      <div className="pb-28">

        {/* HEADER */}

        <div
          className="
            bg-gradient-to-b
            from-green-700
            to-green-600
            px-5
            pt-6
            pb-8
            rounded-b-[2rem]
            shadow-lg
          "
        >

          <h1
            className="
              text-4xl
              font-black
              text-white
            "
          >
            Carrito
          </h1>

          <p
            className="
              text-green-100
              mt-2
            "
          >
            Revisa tu pedido antes de finalizar
          </p>

        </div>

        {/* ITEMS */}

        <div
          className="
            p-4
            space-y-4
            -mt-5
          "
        >

          {items.length === 0 && (

            <div
              className="
                bg-white
                rounded-3xl
                shadow-lg
                p-8
                text-center
              "
            >

              <p
                className="
                  text-gray-500
                  text-lg
                "
              >
                Tu carrito está vacío
              </p>

            </div>

          )}

          {items.map(
            (item, index) => (

              <div
                key={`${item.id}-${index}`}
                className="
                  bg-white
                  rounded-3xl
                  shadow-lg
                  p-5
                "
              >

                <div
                  className="
                    flex
                    justify-between
                    items-start
                  "
                >

                  <div>

                    <h2
                      className="
                        text-2xl
                        font-black
                        text-gray-800
                      "
                    >
                      {item.nombre}
                    </h2>

                    <div
                      className="
                        mt-2
                        space-y-1
                      "
                    >

                      <p className="text-gray-500">
                        📦 {item.envase}
                      </p>

                      <p className="text-gray-500">
                        ⭐ {item.variedad}
                      </p>

                      <p className="text-gray-500">
                        🔢 Cantidad:
                        {' '}
                        {item.cantidad}
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p
                      className="
                        text-2xl
                        font-black
                        text-green-700
                      "
                    >
                      {(
                        item.precio
                        * item.cantidad
                      ).toFixed(2)} €
                    </p>

                    <p
                      className="
                        text-sm
                        text-gray-400
                      "
                    >
                      {item.precio}
                      {' '}
                      € unidad
                    </p>

                  </div>

                </div>

                <button

                  onClick={() =>
                    removeItem(item.id)
                  }

                  className="
                    w-full
                    mt-5
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    py-3
                    rounded-2xl
                    font-bold
                  "
                >

                  Eliminar

                </button>

              </div>

            )
          )}

          {/* TOTAL */}

          {items.length > 0 && (

            <div
              className="
                bg-white
                rounded-3xl
                shadow-lg
                p-6
              "
            >

              <div
                className="
                  flex
                  justify-between
                  items-center
                "
              >

                <span
                  className="
                    text-2xl
                    font-black
                  "
                >
                  Total
                </span>

                <span
                  className="
                    text-3xl
                    font-black
                    text-green-700
                  "
                >
                  {total.toFixed(2)} €
                </span>

              </div>

              <button

                onClick={() => pagar('tarjeta')}

                className="
                  w-full
                  mt-6
                  bg-black
                  hover:bg-gray-900
                  text-white
                  py-4
                  rounded-2xl
                  font-black
                  text-lg
                "
              >

                Pagar con tarjeta

              </button>
<button

  onClick={() => pagar('pendiente')}

  className="
    w-full
    mt-4
    bg-green-600
    hover:bg-green-700
    text-white
    py-4
    rounded-2xl
    font-black
    text-lg
  "
>

  Hacer pedido sin pagar

</button>

            </div>

          )}

        </div>

      </div>

      <BottomNav />

    </MobileLayout>

  )

}