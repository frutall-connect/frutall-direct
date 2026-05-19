'use client'

import { useEffect, useMemo, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import AdminGuard from '@/components/auth/AdminGuard'

import { supabase } from '@/lib/supabaseClient'

export default function AdminClientesPage() {

  const [clientes, setClientes] =
    useState<any[]>([])

  const [pedidos, setPedidos] =
    useState<any[]>([])

  useEffect(() => {

    cargarDatos()

  }, [])

  async function cargarDatos() {

    // CLIENTES

    const { data: perfilesData } =
      await supabase

        .from('perfiles')

        .select('*')

    // PEDIDOS

    const { data: pedidosData } =
      await supabase

        .from('pedidos')

        .select('*')

        .order('created_at', {
          ascending: false
        })

    setClientes(perfilesData || [])

    setPedidos(pedidosData || [])

  }

  const clientesConStats = useMemo(() => {

    return clientes.map((cliente) => {

      const pedidosCliente =
        pedidos.filter(
          (pedido) =>
            pedido.usuario_id === cliente.id
        )

      const totalGastado =
        pedidosCliente.reduce(

          (acc, pedido) =>
            acc + (pedido.total || 0),

          0
        )

      const ultimoPedido =
        pedidosCliente[0]

      return {

        ...cliente,

        pedidos: pedidosCliente.length,

        totalGastado,

        ultimoPedido

      }

    })

  }, [clientes, pedidos])

  return (

    <AdminGuard>

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
            "
          >

            <h1
              className="
                text-3xl
                font-black
              "
            >
              Clientes
            </h1>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              CRM FrutALL
            </p>

          </div>

          {/* LISTA */}

          <div className="p-4 space-y-4">

            {clientesConStats.map(
              (cliente) => (

                <div
                  key={cliente.id}
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
                          break-all
                        "
                      >
                        {cliente.id}
                      </h2>

                      <p
                        className="
                          text-sm
                          text-gray-500
                          mt-1
                        "
                      >
                        {cliente.rol}
                      </p>

                    </div>

                    <div
                      className="
                        bg-green-100
                        text-green-700
                        px-4
                        py-2
                        rounded-full
                        text-sm
                        font-bold
                      "
                    >
                      {cliente.pedidos} pedidos
                    </div>

                  </div>

                  {/* STATS */}

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-4
                      mt-5
                    "
                  >

                    <div
                      className="
                        bg-[#f5f3eb]
                        rounded-2xl
                        p-4
                      "
                    >

                      <p
                        className="
                          text-sm
                          text-gray-500
                        "
                      >
                        Total gastado
                      </p>

                      <h3
                        className="
                          text-2xl
                          font-black
                          mt-2
                          text-green-700
                        "
                      >
                        {cliente.totalGastado.toFixed(2)} €
                      </h3>

                    </div>

                    <div
                      className="
                        bg-[#f5f3eb]
                        rounded-2xl
                        p-4
                      "
                    >

                      <p
                        className="
                          text-sm
                          text-gray-500
                        "
                      >
                        Último pedido
                      </p>

                      <h3
                        className="
                          text-sm
                          font-bold
                          mt-2
                        "
                      >

                        {
                          cliente.ultimoPedido

                            ? new Date(
                                cliente
                                  .ultimoPedido
                                  .created_at
                              ).toLocaleDateString()

                            : 'Sin pedidos'
                        }

                      </h3>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        <BottomNav />

      </MobileLayout>

    </AdminGuard>

  )

}