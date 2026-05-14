'use client'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { useCartStore } from '@/store/cartStore'

import { supabase } from '@/lib/supabaseClient'

export default function CarritoPage() {

  const items = useCartStore((state) => state.items)

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

async function finalizarPedido() {

  if (items.length === 0) return

  const total = items.reduce(

    (acc, item) =>

      acc + item.precio * item.cantidad,

    0

  )

  // 1️⃣ Crear pedido

  const { data: pedidoData, error: pedidoError } =
    await supabase
      .from('pedidos')
      .insert([
        {
          estado: 'pendiente',
          total
        }
      ])
      .select()
      .single()

  if (pedidoError || !pedidoData) {

    console.error(pedidoError)

    return
  }

  // 2️⃣ Crear líneas

  const lineas = items.map((item) => ({

    pedido_id: pedidoData.id,

    producto_id: item.id,

    nombre_producto: item.nombre,

    precio: item.precio,

    cantidad: item.cantidad,

    subtotal: item.precio * item.cantidad

  }))

  const { error: lineasError } =
    await supabase
      .from('lineas_pedido')
      .insert(lineas)

  if (lineasError) {

    console.error(lineasError)

    return
  }

  // 3️⃣ Vaciar carrito

  clearCart()

  // 4️⃣ Aviso

  alert('Pedido realizado correctamente')

}

  return (

    <MobileLayout title="Carrito">

      <div className="p-4 pb-24 space-y-4">

        {items.length === 0 && (

          <div className="bg-white rounded-2xl p-6 text-center shadow">

            <p className="text-gray-500">
              Tu carrito está vacío.
            </p>

          </div>

        )}

        {items.map((item) => (

          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 shadow flex justify-between items-center"
          >

            <div>

              <h3 className="font-bold">
                {item.nombre}
              </h3>

              <p className="text-gray-500">
                {item.cantidad} x {item.precio} €
              </p>

            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="bg-red-500 text-white px-3 py-2 rounded-xl"
            >
              ✕
            </button>

          </div>

        ))}

        {items.length > 0 && (

          <div className="bg-white rounded-2xl p-6 shadow space-y-4">

            <div className="flex justify-between text-xl font-bold">

              <span>Total</span>

              <span>{total.toFixed(2)} €</span>

            </div>

            <button
  onClick={finalizarPedido}
  className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold"
>
  Finalizar pedido
</button>

          </div>

        )}

      </div>

      <BottomNav />

    </MobileLayout>

  )

}