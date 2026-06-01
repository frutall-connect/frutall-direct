'use client'

import { useEffect, useState } from 'react'

import AdminGuard from '@/components/auth/AdminGuard'

import { supabase } from '@/lib/supabaseClient'

export default function AdminOfertasPage() {

  const [productos, setProductos] =
    useState<any[]>([])

  const [ofertas, setOfertas] =
    useState<any[]>([])

  const [productoId, setProductoId] =
    useState('')

  const [precioOferta, setPrecioOferta] =
    useState('')

  useEffect(() => {

    cargarDatos()

  }, [])

  async function cargarDatos() {

    const { data: productosData } =
      await supabase
        .from('productos')
        .select('*')
        .order('nombre')

    const { data: ofertasData } =
      await supabase
        .from('ofertas_home')
        .select(`
          *,
          productos (
            nombre,
            precio
          )
        `)

    setProductos(productosData || [])
    setOfertas(ofertasData || [])

  }

  async function crearOferta() {

    if (!productoId) {
      alert('Selecciona un producto')
      return
    }

    if (!precioOferta) {
      alert('Introduce precio oferta')
      return
    }

    const { error } =
      await supabase
        .from('ofertas_home')
        .insert({

          producto_id:
            productoId,

          precio_oferta:
            Number(precioOferta),

          activa: true

        })

    if (error) {

      alert(error.message)

      return

    }

    alert('Oferta creada')

    setProductoId('')
    setPrecioOferta('')

    cargarDatos()

  }

  async function toggleOferta(
    id: string,
    activa: boolean
  ) {

    const { error } =
      await supabase
        .from('ofertas_home')
        .update({
          activa: !activa
        })
        .eq('id', id)

    if (error) {

      alert(error.message)

      return

    }

    cargarDatos()

  }

  async function borrarOferta(
    id: string
  ) {

    if (
      !confirm(
        '¿Eliminar oferta?'
      )
    ) {
      return
    }

    const { error } =
      await supabase
        .from('ofertas_home')
        .delete()
        .eq('id', id)

    if (error) {

      alert(error.message)

      return

    }

    cargarDatos()

  }

  return (

    <AdminGuard>

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
          Gestión Ofertas
        </h1>

        <div
          className="
            bg-white
            rounded-3xl
            p-6
            shadow-lg
            mb-8
          "
        >

          <h2
            className="
              text-2xl
              font-black
              mb-4
            "
          >
            Nueva oferta
          </h2>

          <select

            value={productoId}

            onChange={(e) =>
              setProductoId(
                e.target.value
              )
            }

            className="
              w-full
              border
              rounded-xl
              p-3
              mb-4
            "
          >

            <option value="">
              Seleccionar producto
            </option>

            {productos.map(
              (producto) => (

                <option
                  key={producto.id}
                  value={producto.id}
                >

                  {producto.nombre}

                </option>

              )
            )}

          </select>

          <input

            type="number"

            step="0.01"

            placeholder="Precio oferta"

            value={precioOferta}

            onChange={(e) =>
              setPrecioOferta(
                e.target.value
              )
            }

            className="
              w-full
              border
              rounded-xl
              p-3
              mb-4
            "

          />

          <button

            onClick={crearOferta}

            className="
              bg-green-700
              text-white
              px-6
              py-3
              rounded-2xl
              font-bold
            "

          >

            Crear oferta

          </button>

        </div>

        <div
          className="
            space-y-4
          "
        >

          {ofertas.map(
            (oferta) => (

              <div

                key={oferta.id}

                className="
                  bg-white
                  rounded-3xl
                  p-5
                  shadow-lg
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

                    <h3
                      className="
                        text-xl
                        font-black
                      "
                    >

                      {
                        oferta
                          ?.productos
                          ?.nombre
                      }

                    </h3>

                    <p>

                      Precio normal:

                      {' '}

                      {
                        oferta
                          ?.productos
                          ?.precio
                      }€

                    </p>

                    <p>

                      Oferta:

                      {' '}

                      {
                        oferta
                          ?.precio_oferta
                      }€

                    </p>

                  </div>

                  <div
                    className="
                      flex
                      gap-3
                    "
                  >

                    <button

                      onClick={() =>
                        toggleOferta(
                          oferta.id,
                          oferta.activa
                        )
                      }

                      className="
                        bg-yellow-500
                        text-white
                        px-4
                        py-2
                        rounded-xl
                      "

                    >

                      {
                        oferta.activa
                          ? 'Desactivar'
                          : 'Activar'
                      }

                    </button>

                    <button

                      onClick={() =>
                        borrarOferta(
                          oferta.id
                        )
                      }

                      className="
                        bg-red-600
                        text-white
                        px-4
                        py-2
                        rounded-xl
                      "

                    >

                      Borrar

                    </button>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </main>

    </AdminGuard>

  )

}