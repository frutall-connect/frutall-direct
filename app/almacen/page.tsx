'use client'

import { useEffect, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

export default function AlmacenPage() {

  const [pedidos, setPedidos] = useState<any[]>([])

  useEffect(() => {
    cargarPedidos()
  }, [])

  async function cargarPedidos() {

    const { data, error } = await supabase

      .from('pedidos')

      .select(`
        *,
        lineas_pedido (*)
      `)

      .order('created_at', {
        ascending: false
      })

    if (!error && data) {
      setPedidos(data)
    }

  }

  async function cambiarEstado(
  id: string,
  estado: string
) {

  console.log(
    'CLICK:',
    id,
    estado
  )

  const { data, error } =
    await supabase

      .from('pedidos')

      .update({
        estado
      })

      .eq('id', id)

      .select()

  console.log(
    'DATA:',
    data
  )

  console.log(
    'ERROR:',
    error
  )

  if (error) {

    alert(
      error.message
    )

    return

  }

  cargarPedidos()

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

  return (

    <MobileLayout>

      <div className="min-h-screen bg-[#f5f3eb] pb-48">

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
            Panel Almacén
          </h1>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Gestión operativa de pedidos
          </p>

        </div>

        {/* PEDIDOS */}

        <div className="p-4 space-y-5">

          {pedidos.map((pedido) => (

            <div
              key={pedido.id}
              className="
                bg-white
                rounded-3xl
                shadow-lg
                p-5
              "
            >

              {/* TOP */}

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
                      text-xl
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
                  {pedido.estado}
                </div>

              </div>

              {/* PRODUCTOS */}

              <div className="mt-5 space-y-3">

                {pedido.lineas_pedido?.map(
                  (linea: any, index: number) => (

                    <div
                      key={index}
                      className="
                        bg-[#f5f3eb]
                        rounded-2xl
                        p-3
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

              {/* ESTADOS */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  mt-5
                "
              >

                <button
                  onClick={() =>
                    cambiarEstado(
                      pedido.id,
                      'preparando'
                    )
                  }
                  className="
                    bg-blue-600
                    text-white
                    rounded-2xl
                    py-3
                    font-bold
                  "
                >
                  Preparando
                </button>

                <button
                  onClick={() =>
                    cambiarEstado(
                      pedido.id,
                      'enviado'
                    )
                  }
                  className="
                    bg-purple-600
                    text-white
                    rounded-2xl
                    py-3
                    font-bold
                  "
                >
                  Enviado
                </button>

                <button
                  onClick={() =>
                    cambiarEstado(
                      pedido.id,
                      'entregado'
                    )
                  }
                  className="
                    col-span-2
                    bg-green-700
                    text-white
                    rounded-2xl
                    py-4
                    font-black
                  "
                >
                  Marcar Entregado
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