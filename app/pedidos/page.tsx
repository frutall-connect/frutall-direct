'use client'

import { useEffect, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'

import BackButton
  from '@/components/ui/BackButton'

import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

import {
  generarAlbaran
} from '@/lib/generarAlbaran'

export default function PedidosPage() {

  const [pedidos, setPedidos] =
    useState<any[]>([])

  useEffect(() => {

    cargarPedidos()

    escucharCambios()

  }, [])

  async function cargarPedidos() {

    const { data: authData } =
      await supabase.auth.getUser()

    const usuario = authData.user

    if (!usuario) return

    // ===== PERFIL =====

    const { data: perfil } =
      await supabase

        .from('perfiles')

        .select('rol')

        .eq('id', usuario.id)

        .single()

    // ===== QUERY =====

    let query =
      supabase

        .from('pedidos')

        .select(`
          *,
          lineas_pedido (*)
        `)

        .order('created_at', {
          ascending: false
        })

    // ===== CLIENTE =====

    if (perfil?.rol !== 'admin') {

      query = query.eq(
        'usuario_id',
        usuario.id
      )

    }

    const {
      data,
      error
    } = await query

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

  function colorEstado(
    estado: string
  ) {

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

  function iconoEstado(
    estado: string
  ) {

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

     <BackButton />

      <div className="min-h-screen bg-white pb-32">

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
                      Pedido #{pedido.id}
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
                      ${colorEstado(
                        pedido.estado
                      )}
                    `}
                  >

                    {iconoEstado(
                      pedido.estado
                    )}

                    {' '}

                    {pedido.estado}

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
                    (
                      linea: any,
                      index: number
                    ) => (

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
                            {
                              linea.nombre_producto
                            }
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
                          {
                            linea.subtotal
                              ?.toFixed(2)
                          } €
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
                    {
                      pedido.total
                        ?.toFixed(2)
                    } €
                  </span>

                </div>

                {/* PDF */}

                <button

                  onClick={() =>
                    generarAlbaran(
                      pedido
                    )
                  }

                  className="
                    w-full
                    mt-5
                    bg-black
                    text-white
                    rounded-2xl
                    py-3
                    font-bold
                  "
                >

                  Descargar albarán

                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

      <BottomNav />

    </MobileLayout>

  )

}