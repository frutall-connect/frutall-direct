'use client'

import {
  useEffect,
  useMemo,
  useState
} from 'react'

import MobileLayout
  from '@/components/layout/MobileLayout'

import BottomNav
  from '@/components/layout/BottomNav'

import AdminGuard
  from '@/components/auth/AdminGuard'

import { supabase }
  from '@/lib/supabaseClient'

export default function AdminClientesPage() {

  const [clientes, setClientes] =
    useState<any[]>([])

  const [pedidos, setPedidos] =
    useState<any[]>([])

  const [busqueda, setBusqueda] =
    useState('')

  useEffect(() => {

    cargarDatos()

  }, [])

  async function cargarDatos() {

    const { data: perfilesData } =
      await supabase

        .from('perfiles')

        .select('*')

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

    return clientes

      .map((cliente) => {

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

      .filter((cliente) => {

        const texto = `
          ${cliente.empresa || ''}
          ${cliente.contacto || ''}
          ${cliente.telefono || ''}
          ${cliente.cif || ''}
        `.toLowerCase()

        return texto.includes(
          busqueda.toLowerCase()
        )

      })

  }, [clientes, pedidos, busqueda])

  return (

    <AdminGuard>

      <MobileLayout>

        <div className="min-h-screen  pb-32">

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
              CRM Clientes
            </h1>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Gestión comercial
            </p>

          </div>

          {/* BUSCADOR */}

          <div className="p-4">

            <input
              type="text"
              placeholder="Buscar cliente..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
              className="
                w-full
                bg-white
                rounded-3xl
                px-5
                py-4
                shadow-lg
                outline-none
              "
            />

          </div>

          {/* CLIENTES */}

          <div className="px-4 space-y-5">

            {clientesConStats.map(
              (cliente) => (

                <div
                  key={cliente.id}
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
                        gap-4
                      "
                    >

                      <div>

                        <h2
                          className="
                            text-2xl
                            font-black
                          "
                        >
                          {
                            cliente.empresa
                            || 'Sin empresa'
                          }
                        </h2>

                        <p
                          className="
                            text-gray-500
                            mt-1
                          "
                        >
                          {
                            cliente.contacto
                            || 'Sin contacto'
                          }
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
                          shrink-0
                        "
                      >
                        {cliente.pedidos} pedidos
                      </div>

                    </div>

                    {/* INFO */}

                    <div className="mt-5 space-y-3">

                      <div
                        className="
                          bg-white
                          rounded-2xl
                          p-4
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-gray-500
                          "
                        >
                          Email
                        </p>

                        <p className="font-bold break-all">
                          {
                            cliente.email
                            || 'No disponible'
                          }
                        </p>

                      </div>

                      <a
                        href={`tel:${cliente.telefono}`}
                        className="
                          block
                          bg-white
                          rounded-2xl
                          p-4
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-gray-500
                          "
                        >
                          Teléfono
                        </p>

                        <p className="font-bold">
                          {
                            cliente.telefono
                            || 'No disponible'
                          }
                        </p>

                      </a>

                      <div
                        className="
                          bg-white
                          rounded-2xl
                          p-4
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-gray-500
                          "
                        >
                          Dirección
                        </p>

                        <p className="font-bold">
                          {
                            cliente.direccion
                            || 'No disponible'
                          }
                        </p>

                      </div>

                      <div
                        className="
                          bg-white
                          rounded-2xl
                          p-4
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-gray-500
                          "
                        >
                          CIF / NIF
                        </p>

                        <p className="font-bold">
                          {
                            cliente.cif
                            || 'No disponible'
                          }
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* KPIS */}

                  <div
                    className="
                      bg-[#faf9f6]
                      border-t
                      px-5
                      py-5
                      grid
                      grid-cols-2
                      gap-4
                    "
                  >

                    <div
                      className="
                        bg-white
                        rounded-2xl
                        p-4
                      "
                    >

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >
                        Total gastado
                      </p>

                      <h3
                        className="
                          text-2xl
                          font-black
                          text-green-700
                          mt-2
                        "
                      >
                        {
                          cliente.totalGastado
                            .toFixed(2)
                        } €
                      </h3>

                    </div>

                    <div
                      className="
                        bg-white
                        rounded-2xl
                        p-4
                      "
                    >

                      <p
                        className="
                          text-xs
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