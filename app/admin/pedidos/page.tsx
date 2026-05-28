'use client'

import { useEffect, useState }
  from 'react'

import { supabase }
  from '@/lib/supabaseClient'

import AdminGuard
  from '@/components/auth/AdminGuard'

export default function AdminPedidosPage() {

  const [pedidos, setPedidos] =
    useState<any[]>([])

  async function cargarPedidos() {

    const { data } =
      await supabase

        .from('pedidos')

        .select('*')

        .order(
          'created_at',
          {
            ascending: false
          }
        )

    setPedidos(data || [])

  }

  async function cambiarEstado(
    id: number,
    estado: string
  ) {

    await supabase

      .from('pedidos')

      .update({

        estado

      })

      .eq('id', id)

    cargarPedidos()

  }

  useEffect(() => {

    cargarPedidos()

  }, [])

  return (

    <AdminGuard
      allow={[
        'admin',
        'almacen'
      ]}
    >

      <main
        className="
          min-h-screen
          bg-white
          p-6
        "
      >

        <h1
          className="
            text-4xl
            font-black
            mb-8
          "
        >
          Admin Pedidos
        </h1>

        <div className="space-y-4">

          {pedidos.map((pedido) => (

            <div

              key={pedido.id}

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

                  <p className="text-gray-500">
                    Usuario:
                    {' '}
                    {pedido.usuario_id}
                  </p>

                  <p className="text-gray-500">
                    Método:
                    {' '}
                    {pedido.metodo_pago}
                  </p>

                  <p className="text-gray-500">
                    Pagado:
                    {' '}
                    {pedido.pagado
                      ? 'Sí'
                      : 'No'}
                  </p>

                </div>

                <div className="text-right">

                  <p
                    className="
                      text-3xl
                      font-black
                      text-green-700
                    "
                  >
                    {pedido.total} €
                  </p>

                </div>

              </div>

              <div className="mt-6">

                <select

                  value={pedido.estado}

                  onChange={(e) =>
                    cambiarEstado(

                      pedido.id,

                      e.target.value

                    )
                  }

                  className="
                    w-full
                    p-4
                    rounded-2xl
                    bg-gray-100
                  "
                >

                  <option value="pendiente">
                    Pendiente
                  </option>

                  <option value="pagado">
                    Pagado
                  </option>

                  <option value="preparando">
                    Preparando
                  </option>

                  <option value="enviado">
                    Enviado
                  </option>

                  <option value="entregado">
                    Entregado
                  </option>

                </select>

                <a

                  href={`/admin/pedidos/${pedido.id}`}

                  className="
                    block
                    mt-4
                    bg-black
                    text-white
                    text-center
                    py-3
                    rounded-2xl
                    font-bold
                  "
                >

                  Ver detalle

                </a>

              </div>

            </div>

          ))}

        </div>

      </main>

    </AdminGuard>

  )

}