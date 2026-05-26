'use client'

import { useEffect, useState }
  from 'react'

import Header
  from '@/components/layout/Header'

import BottomNav
  from '@/components/layout/BottomNav'

import { supabase }
  from '@/lib/supabaseClient'

export default function PickingPage() {

  const [productos, setProductos] =
    useState<any[]>([])

  useEffect(() => {

    cargarPicking()

  }, [])

  async function cargarPicking() {

    const { data, error } =
      await supabase

        .from('pedidos')

        .select(`
          *,
          lineas_pedido (*)
        `)

        .in(
          'estado',
          [
            'pendiente',
            'preparando'
          ]
        )

    if (error || !data) {

      console.error(error)

      return

    }

    const agrupado:
      Record<string, number> = {}

    data.forEach((pedido) => {

      pedido.lineas_pedido?.forEach(

        (linea: any) => {

          if (
            !agrupado[
              linea.nombre_producto
            ]
          ) {

            agrupado[
              linea.nombre_producto
            ] = 0

          }

          agrupado[
            linea.nombre_producto
          ] += linea.cantidad

        }

      )

    })

    const resultado =

      Object.entries(agrupado)

        .map(

          ([nombre, cantidad]) => ({

            nombre,

            cantidad

          })

        )

        .sort(

          (
            a,
            b
          ) =>

            b.cantidad
            - a.cantidad

        )

    setProductos(resultado)

  }

  return (

    <>

      <Header />

      <main
        className="
          min-h-screen
          bg-[#f5f3eb]
          p-5
          pb-32
        "
      >

        <div
          className="
            mb-8
          "
        >

          <h1
            className="
              text-4xl
              font-black
            "
          >
            Picking
          </h1>

          <p
            className="
              text-gray-500
              mt-2
            "
          >
            Preparación agrupada
            de pedidos
          </p>

        </div>

        <div className="space-y-4">

          {productos.map(

            (
              producto,
              index
            ) => (

              <div

                key={index}

                className="
                  bg-white
                  rounded-3xl
                  shadow-lg
                  p-6
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
                    {
                      producto.nombre
                    }
                  </h2>

                </div>

                <div
                  className="
                    bg-green-700
                    text-white
                    rounded-2xl
                    px-6
                    py-3
                    text-3xl
                    font-black
                  "
                >

                  {
                    producto.cantidad
                  }

                </div>

              </div>

            )

          )}

        </div>

      </main>

      <BottomNav />

    </>

  )

}