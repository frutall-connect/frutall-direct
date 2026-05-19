'use client'

import { useEffect, useMemo, useState } from 'react'

import {

  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell

} from 'recharts'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import AdminGuard from '@/components/auth/AdminGuard'

import { supabase } from '@/lib/supabaseClient'

export default function AdminDashboardPage() {

  const [pedidos, setPedidos] =
    useState<any[]>([])

  const [productos, setProductos] =
    useState<any[]>([])

  const [usuarios, setUsuarios] =
    useState(0)

  useEffect(() => {

    cargarDatos()

  }, [])

  async function cargarDatos() {

    const { data: pedidosData } =
      await supabase

        .from('pedidos')

        .select(`
          *,
          lineas_pedido (*)
        `)

        .order('created_at', {
          ascending: false
        })

    const { data: productosData } =
      await supabase

        .from('productos')

        .select('*')

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

  // KPIS

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

  // VENTAS POR DÍA

  const ventasPorDia = useMemo(() => {

    const grouped: any = {}

    pedidos.forEach((pedido) => {

      const fecha =
        new Date(
          pedido.created_at
        ).toLocaleDateString()

      if (!grouped[fecha]) {

        grouped[fecha] = 0

      }

      grouped[fecha] += pedido.total || 0

    })

    return Object.entries(grouped).map(
      ([fecha, total]) => ({

        fecha,

        total

      })
    )

  }, [pedidos])

  // ESTADOS

  const pedidosPorEstado = [

    {
      name: 'Pendiente',
      value: pedidos.filter(
        (p) => p.estado === 'pendiente'
      ).length
    },

    {
      name: 'Preparando',
      value: pedidos.filter(
        (p) => p.estado === 'preparando'
      ).length
    },

    {
      name: 'Enviado',
      value: pedidos.filter(
        (p) => p.estado === 'enviado'
      ).length
    },

    {
      name: 'Entregado',
      value: pedidos.filter(
        (p) => p.estado === 'entregado'
      ).length
    }

  ]

  const COLORS = [
    '#eab308',
    '#3b82f6',
    '#9333ea',
    '#16a34a'
  ]

  // TOP PRODUCTOS

  const topProductos = useMemo(() => {

    const contador: any = {}

    pedidos.forEach((pedido) => {

      pedido.lineas_pedido?.forEach(
        (linea: any) => {

          if (
            !contador[
              linea.nombre_producto
            ]
          ) {

            contador[
              linea.nombre_producto
            ] = 0

          }

          contador[
            linea.nombre_producto
          ] += linea.cantidad

        }
      )

    })

    return Object.entries(contador)

      .map(([nombre, cantidad]) => ({

        nombre,

        cantidad

      }))

      .sort(
        (a: any, b: any) =>
          b.cantidad - a.cantidad
      )

      .slice(0, 5)

  }, [pedidos])

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
              Dashboard
            </h1>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Analytics FrutALL
            </p>

          </div>

          {/* KPIS */}

          <div className="p-4 grid grid-cols-2 gap-4">

            <div
              className="
                bg-green-700
                text-white
                rounded-3xl
                p-5
              "
            >

              <p className="opacity-70">
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

            <div
              className="
                bg-black
                text-white
                rounded-3xl
                p-5
              "
            >

              <p className="opacity-70">
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

            <div
              className="
                bg-yellow-500
                text-white
                rounded-3xl
                p-5
              "
            >

              <p className="opacity-70">
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

            <div
              className="
                bg-purple-700
                text-white
                rounded-3xl
                p-5
              "
            >

              <p className="opacity-70">
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

          {/* VENTAS */}

          <div className="px-4">

            <div
              className="
                bg-white
                rounded-3xl
                p-5
                shadow-lg
              "
            >

              <h2
                className="
                  text-2xl
                  font-black
                  mb-5
                "
              >
                Ventas por día
              </h2>

              <div className="h-72">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={ventasPorDia}
                  >

                    <XAxis dataKey="fecha" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="total"
                      fill="#16a34a"
                      radius={[10, 10, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

          </div>

          {/* ESTADOS */}

          <div className="p-4">

            <div
              className="
                bg-white
                rounded-3xl
                p-5
                shadow-lg
              "
            >

              <h2
                className="
                  text-2xl
                  font-black
                  mb-5
                "
              >
                Estados pedidos
              </h2>

              <div className="h-72">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie

                      data={pedidosPorEstado}

                      dataKey="value"

                      outerRadius={100}

                    >

                      {pedidosPorEstado.map(
                        (_, index) => (

                          <Cell
                            key={index}
                            fill={COLORS[index]}
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </div>

          </div>

          {/* TOP PRODUCTOS */}

          <div className="px-4">

            <div
              className="
                bg-white
                rounded-3xl
                p-5
                shadow-lg
              "
            >

              <h2
                className="
                  text-2xl
                  font-black
                  mb-5
                "
              >
                Top productos
              </h2>

              <div className="space-y-4">

                {topProductos.map(
                  (
                    producto: any,
                    index
                  ) => (

                    <div
                      key={index}
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
                          {producto.nombre}
                        </p>

                      </div>

                      <div
                        className="
                          text-green-700
                          font-black
                          text-xl
                        "
                      >
                        {producto.cantidad}
                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </div>

        <BottomNav />

      </MobileLayout>

    </AdminGuard>

  )

}