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

  const [preparados, setPreparados] =
  useState<Record<string, boolean>>({})

  useEffect(() => {

    cargarPicking()

  }, [])

  async function cargarPicking() {

function togglePreparado(
  nombre: string
) {

  setPreparados({

    ...preparados,

    [nombre]:
      !preparados[nombre]

  })

}

    const { data, error } =
      await supabase

        .from('pedidos')

        .select(`
          *,
          lineas_pedido (

  *,

  productos (

    id,

    ubicacion_id,

    ubicaciones (

      codigo,

      tipo

    )

  )

)
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
Record<
  string,
  {
    cantidad: number
    ubicacion: string
    tipo: string
  }
> = {}

    data.forEach((pedido) => {

      pedido.lineas_pedido?.forEach(

  (linea: any) => {

    const nombre =
      linea.nombre_producto

    const ubicacion =

      linea.productos
        ?.ubicaciones
        ?.codigo || 'SIN UBICACIÓN'

    const tipo =

      linea.productos
        ?.ubicaciones
        ?.tipo || ''

    if (!agrupado[nombre]) {

      agrupado[nombre] = {

        cantidad: 0,

        ubicacion,

        tipo

      }

    }

    agrupado[nombre]
      .cantidad += linea.cantidad

  }

)

    })

    const resultado =

      Object.entries(agrupado)

        .map(

          ([nombre, datos]) => ({

  nombre,

  cantidad:
    datos.cantidad,

  ubicacion:
    datos.ubicacion,

  tipo:
    datos.tipo

})

        )

        .sort(

  (
    a,
    b
  ) =>

    a.ubicacion.localeCompare(
      b.ubicacion
    )

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

               <div
  className="
    flex
    items-start
    gap-4
  "
>

  <input

    type="checkbox"

    checked={
      preparados[
        producto.nombre
      ] || false
    }

    onChange={() =>

      togglePreparado(
        producto.nombre
      )

    }

    className="
      w-6
      h-6
      mt-2
    "

  />

  <div>

    <h2
      className={`
        text-2xl
        font-black

        ${

          preparados[
            producto.nombre
          ]

            ? 'line-through opacity-40'

            : ''

        }
      `}
    >

      {producto.nombre}

    </h2>

    <p
      className="
        text-gray-500
        mt-2
        font-bold
      "
    >

      📍
      {producto.ubicacion}

      {' · '}

      {producto.tipo}

    </p>

  </div>

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