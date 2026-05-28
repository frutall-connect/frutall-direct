'use client'

import { useEffect, useState }
  from 'react'

import { useParams }
  from 'next/navigation'

import { supabase }
  from '@/lib/supabaseClient'

export default function PedidoDetallePage() {

  const params = useParams()

  const [pedido, setPedido] =
    useState<any>(null)

  const [lineas, setLineas] =
    useState<any[]>([])

  async function cargarPedido() {

    const { data: pedidoData } =
      await supabase

        .from('pedidos')

        .select('*')

        .eq('id', params.id)

        .single()

    setPedido(pedidoData)

    const { data: lineasData } =
      await supabase

        .from('lineas_pedido')

        .select('*')

        .eq(
          'pedido_id',
          params.id
        )

    setLineas(lineasData || [])

  }

  useEffect(() => {

    if (params.id) {

      cargarPedido()

    }

  }, [params.id])

  if (!pedido) {

    return (

      <main className="p-10">

        Cargando...

      </main>

    )

  }

  return (

    <main
      className="
        min-h-screen
        bg-white
        p-6
      "
    >

      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl
          p-8
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

            <h1
              className="
                text-4xl
                font-black
              "
            >
              Pedido #{pedido.id}
            </h1>

            <p className="text-gray-500 mt-2">
              Cliente:
              {' '}
              {pedido.usuario_id}
            </p>

            <p className="text-gray-500">
              Estado:
              {' '}
              {pedido.estado}
            </p>

            <p className="text-gray-500">
              Método:
              {' '}
              {pedido.metodo_pago}
            </p>

          </div>

          <div className="text-right">

            <p
              className="
                text-5xl
                font-black
                text-green-700
              "
            >
              {pedido.total} €
            </p>

          </div>

        </div>

      </div>

      <div className="mt-6 space-y-4">

        {lineas.map((linea) => (

          <div

            key={linea.id}

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

              <div>

                <h2
                  className="
                    text-2xl
                    font-black
                  "
                >
                  {linea.nombre_producto}
                </h2>

                <p className="text-gray-500">
                  Cantidad:
                  {' '}
                  {linea.cantidad}
                </p>

                <p className="text-gray-500">
                  Precio:
                  {' '}
                  {linea.precio} €
                </p>

              </div>

              <div>

                <p
                  className="
                    text-3xl
                    font-black
                    text-green-700
                  "
                >
                  {linea.subtotal} €
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </main>

  )

}