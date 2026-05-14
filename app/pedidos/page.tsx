'use client'

import { useEffect, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

export default function PedidosPage() {

  const [pedidos, setPedidos] = useState<any[]>([])

  useEffect(() => {
    cargarPedidos()
  }, [])

  async function cargarPedidos() {

    const { data, error } = await supabase

      .from('pedidos')

      .select(`
        *,
        lineas_pedido (
          *
        )
      `)

      .order('created_at', {
        ascending: false
      })

    if (!error && data) {
      setPedidos(data)
    }

  }

  return (

    <MobileLayout title="Pedidos">

      <div className="p-4 pb-24 space-y-4">

        {pedidos.length === 0 && (

          <div className="bg-white rounded-2xl p-6 shadow text-center">

            <p className="text-gray-500">
              No hay pedidos todavía.
            </p>

          </div>

        )}

        {pedidos.map((pedido) => (

          <div
            key={pedido.id}
            className="bg-white rounded-2xl shadow p-4"
          >

            <div className="flex justify-between items-center">

              <div>

                <h3 className="font-bold text-lg">
                  Pedido
                </h3>

                <p className="text-sm text-gray-500">
                  {new Date(
                    pedido.created_at
                  ).toLocaleString()}
                </p>

              </div>

              <div
                className="
                  bg-yellow-100
                  text-yellow-700
                  px-3
                  py-1
                  rounded-xl
                  text-sm
                  font-semibold
                "
              >
                {pedido.estado}
              </div>

            </div>

            <div className="mt-4 space-y-2">

              {pedido.lineas_pedido.map((linea: any) => (

                <div
                  key={linea.id}
                  className="flex justify-between text-sm"
                >

                  <span>
                    {linea.cantidad} x {linea.nombre_producto}
                  </span>

                  <span>
                    {linea.subtotal} €
                  </span>

                </div>

              ))}

            </div>

            <div className="mt-4 pt-4 border-t flex justify-between font-bold">

              <span>Total</span>

              <span>{pedido.total} €</span>

            </div>

          </div>

        ))}

      </div>

      <BottomNav />

    </MobileLayout>

  )

}