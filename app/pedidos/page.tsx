'use client'

import { useEffect, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

export default function PedidosPage() {

  const [pedidos, setPedidos] = useState<any[]>([])

  useEffect(() => {

    cargarPedidos()

    escucharCambios()

  }, [])

  async function cargarPedidos() {

    const { data: authData } =
      await supabase.auth.getUser()

    const usuario = authData.user

    if (!usuario) return

    const { data, error } = await supabase

      .from('pedidos')

      .select(`
        *,
        lineas_pedido (*)
      `)

      .eq('usuario_id', usuario.id)

      .order('created_at', {
        ascending: false
      })

    if (!error && data) {
      setPedidos(data)
    }

  }

  function escucharCambios() {

    const channel = supabase

      .channel('pedidos-channel')

      .on(

        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table: 'pedidos'
        },

        () => {

          cargarPedidos()

        }

      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }

  function colorEstado(estado: string) {

    switch (estado) {

      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'

      case 'preparando':
        return 'bg-blue-100 text-blue-800'

      case 'enviado':
        return 'bg-purple-100 text-purple-800'

      case 'entregado':
        return 'bg-green-100 text-green-800'

      default:
        return 'bg-gray-100 text-gray-800'

    }

  }

  function iconoEstado(estado: string) {

    switch (estado) {

      case 'pendiente':
        return '🟡'

      case 'preparando':
        return '🔵'

      case 'enviado':
        return '🟣'

      case 'entregado':
        return '🟢'

      default:
        return '⚪'

    }

  }

  return (

    <MobileLayout>

      <div className="min-h-screen bg-[#f5f3eb] pb-32">

        {/* HEADER */}

        <div
          className="
            bg-white
            px-5
            pt-5
            pb-4
            border-b
            sticky
            top-0
            z-40
          "
        >

          <h1
            className="
              text-3xl
              font-black
              text-black
            "
          >
            Mis Pedidos
          </h1>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Seguimiento en tiempo real
          </p>

        </div>

        {/* PEDIDOS */}

        <div className="p-4 space-y-5">

          {pedidos.length === 0 && (

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
                  text-lg
                  text-gray-500
                "
              >
                No tienes pedidos todavía
              </p>

            </div>

          )}

          {pedidos.map((pedido) => (

            <div
              key={pedido.id}
              className="
                bg-white
                rounded-3xl
                shadow-lg
                overflow-hidden
              "
            >

              {/* TOP */}

              <div className="p-5">

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
                      "
                    >
                      Pedido
                    </h2>

                    <p
                      className="
                        text-sm
                        text-gray-500
                        mt-1
                      "
                    >
                      {new Date(
                        pedido.created_at
                      ).toLocaleString()}
                    </p>

                  </div>

                  <div
                    className={`
                      px-4
                      py-2
                      rounded-full
                      text-sm
                      font-bold
                      ${colorEstado(pedido.estado)}
                    `}
                  >
                    {iconoEstado(pedido.estado)}
                    {' '}
                    {pedido.estado}
                  </div>

                </div>

                {/* TIMELINE */}

                <div className="mt-6">

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div className="flex flex-col items-center">

                      <div
                        className={`
                          w-10
                          h-10
                          rounded-full
                          flex
                          items-center
                          justify-center
                          text-white
                          font-bold

                          ${
                            pedido.estado === 'pendiente'
                            || pedido.estado === 'preparando'
                            || pedido.estado === 'enviado'
                            || pedido.estado === 'entregado'

                              ? 'bg-yellow-500'

                              : 'bg-gray-300'
                          }
                        `}
                      >
                        1
                      </div>

                      <p className="text-xs mt-2">
                        Pendiente
                      </p>

                    </div>

                    <div className="flex-1 h-1 bg-gray-200 mx-2" />

                    <div className="flex flex-col items-center">

                      <div
                        className={`
                          w-10
                          h-10
                          rounded-full
                          flex
                          items-center
                          justify-center
                          text-white
                          font-bold

                          ${
                            pedido.estado === 'preparando'
                            || pedido.estado === 'enviado'
                            || pedido.estado === 'entregado'

                              ? 'bg-blue-500'

                              : 'bg-gray-300'
                          }
                        `}
                      >
                        2
                      </div>

                      <p className="text-xs mt-2">
                        Preparando
                      </p>

                    </div>

                    <div className="flex-1 h-1 bg-gray-200 mx-2" />

                    <div className="flex flex-col items-center">

                      <div
                        className={`
                          w-10
                          h-10
                          rounded-full
                          flex
                          items-center
                          justify-center
                          text-white
                          font-bold

                          ${
                            pedido.estado === 'enviado'
                            || pedido.estado === 'entregado'

                              ? 'bg-purple-500'

                              : 'bg-gray-300'
                          }
                        `}
                      >
                        3
                      </div>

                      <p className="text-xs mt-2">
                        Enviado
                      </p>

                    </div>

                    <div className="flex-1 h-1 bg-gray-200 mx-2" />

                    <div className="flex flex-col items-center">

                      <div
                        className={`
                          w-10
                          h-10
                          rounded-full
                          flex
                          items-center
                          justify-center
                          text-white
                          font-bold

                          ${
                            pedido.estado === 'entregado'

                              ? 'bg-green-600'

                              : 'bg-gray-300'
                          }
                        `}
                      >
                        4
                      </div>

                      <p className="text-xs mt-2">
                        Entregado
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* PRODUCTOS */}

              <div
                className="
                  bg-[#f9f8f4]
                  px-5
                  py-4
                  border-t
                "
              >

                <div className="space-y-3">

                  {pedido.lineas_pedido?.map(
                    (linea: any, index: number) => (

                      <div
                        key={index}
                        className="
                          flex
                          justify-between
                          items-center
                        "
                      >

                        <div>

                          <p className="font-bold">
                            {linea.nombre_producto}
                          </p>

                          <p
                            className="
                              text-sm
                              text-gray-500
                            "
                          >
                            Cantidad:
                            {' '}
                            {linea.cantidad}
                          </p>

                        </div>

                        <p
                          className="
                            font-black
                            text-green-700
                          "
                        >
                          {linea.subtotal?.toFixed(2)} €
                        </p>

                      </div>

                    )
                  )}

                </div>

                {/* TOTAL */}

                <div
                  className="
                    flex
                    justify-between
                    items-center
                    mt-5
                    pt-4
                    border-t
                  "
                >

                  <span
                    className="
                      text-lg
                      font-bold
                    "
                  >
                    Total
                  </span>

                  <span
                    className="
                      text-2xl
                      font-black
                      text-green-700
                    "
                  >
                    {pedido.total?.toFixed(2)} €
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      <BottomNav />

    </MobileLayout>

  )

}