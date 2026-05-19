'use client'

import { useEffect, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import AdminGuard from '@/components/auth/AdminGuard'

import { supabase } from '@/lib/supabaseClient'

export default function AdminDashboardPage() {

  const [pedidos, setPedidos] = useState<any[]>([])

  const [productos, setProductos] = useState<any[]>([])

  const [usuarios, setUsuarios] = useState(0)

  useEffect(() => {

    cargarDatos()

  }, [])

  async function cargarDatos() {

    // PEDIDOS

    const { data: pedidosData } =
      await supabase

        .from('pedidos')

        .select('*')

        .order('created_at', {
          ascending: false
        })

    // PRODUCTOS

    const { data: productosData } =
      await supabase

        .from('productos')

        .select('*')

    // USUARIOS

    const { data: perfilesData } =
      await supabase

        .from('perfiles')

        .select('*')

    setPedidos(pedidosData || [])

    setProductos(productosData || [])

    setUsuarios(
      perfilesData?.length || 0
    )

  }

  // KPIs

  const ventasTotales =
    pedidos.reduce(

      (acc, pedido) =>
        acc + (pedido.total || 0),

      0
    )

  const pendientes =
    pedidos.filter(
      (p) => p.estado === 'pendiente'
    ).length

  const productosActivos =
    productos.filter(
      (p) => p.activo
    ).length

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
              Dashboard
            </h1>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Control operativo FrutALL
            </p>

          </div>

          {/* KPIs */}

          <div className="p-4 grid grid-cols-2 gap-4">

            {/* VENTAS */}

            <div
              className="
                bg-green-700
                text-white
                rounded-3xl
                p-5
                shadow-lg
              "
            >

              <p className="text-sm opacity-80">
                Ventas
              </p>

              <h2
                className="
                  text-3xl
                  font-black
                  mt-2
                "
              >
                {ventasTotales.toFixed(2)} €
              </h2>

            </div>

            {/* PEDIDOS */}

            <div
              className="
                bg-black
                text-white
                rounded-3xl
                p-5
                shadow-lg
              "
            >

              <p className="text-sm opacity-80">
                Pedidos
              </p>

              <h2
                className="
                  text-3xl
                  font-black
                  mt-2
                "
              >
                {pedidos.length}
              </h2>

            </div>

            {/* PENDIENTES */}

            <div
              className="
                bg-yellow-500
                text-white
                rounded-3xl
                p-5
                shadow-lg
              "
            >

              <p className="text-sm opacity-80">
                Pendientes
              </p>

              <h2
                className="
                  text-3xl
                  font-black
                  mt-2
                "
              >
                {pendientes}
              </h2>

            </div>

            {/* PRODUCTOS */}

            <div
              className="
                bg-purple-700
                text-white
                rounded-3xl
                p-5
                shadow-lg
              "
            >

              <p className="text-sm opacity-80">
                Productos
              </p>

              <h2
                className="
                  text-3xl
                  font-black
                  mt-2
                "
              >
                {productosActivos}
              </h2>

            </div>

          </div>

          {/* USUARIOS */}

          <div className="px-4">

            <div
              className="
                bg-white
                rounded-3xl
                shadow-lg
                p-5
              "
            >

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Usuarios registrados
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {usuarios}
              </h2>

            </div>

          </div>

          {/* ÚLTIMOS PEDIDOS */}

          <div className="p-4">

            <div
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
                  items-center
                  mb-5
                "
              >

                <h2
                  className="
                    text-2xl
                    font-black
                  "
                >
                  Últimos pedidos
                </h2>

              </div>

              <div className="space-y-4">

                {pedidos
                  .slice(0, 5)
                  .map((pedido) => (

                    <div
                      key={pedido.id}
                      className="
                        bg-[#f5f3eb]
                        rounded-2xl
                        p-4
                        flex
                        justify-between
                        items-center
                      "
                    >

                      <div>

                        <p className="font-bold">
                          Pedido
                        </p>

                        <p
                          className="
                            text-sm
                            text-gray-500
                          "
                        >
                          {pedido.estado}
                        </p>

                      </div>

                      <div className="text-right">

                        <p
                          className="
                            font-black
                            text-green-700
                          "
                        >
                          {pedido.total?.toFixed(2)} €
                        </p>

                      </div>

                    </div>

                  ))}

              </div>

            </div>

          </div>

        </div>

        <BottomNav />

      </MobileLayout>

    </AdminGuard>

  )

}