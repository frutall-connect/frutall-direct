'use client'

import { useEffect, useMemo, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

import { useCartStore } from '@/store/cartStore'

const imagenPlaceholder =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200'

export default function ProductosPage() {

  const [productos, setProductos] = useState<any[]>([])

  const [busqueda, setBusqueda] = useState('')

  const addItem = useCartStore(
    (state) => state.addItem
  )

  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {

    const { data, error } = await supabase

      .from('productos')

      .select(`
        *,
        categorias (
          nombre,
          color,
          icono
        )
      `)

    if (!error && data) {
      setProductos(data)
    }

  }

  const productosFiltrados = useMemo(() => {

    return productos.filter((producto) =>

      producto.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase())

    )

  }, [productos, busqueda])

  return (

    <MobileLayout title="Productos">

      <div className="pb-28">

        {/* HEADER */}

        <div
          className="
            bg-gradient-to-b
            from-green-700
            to-green-600
            px-5
            pt-6
            pb-8
            rounded-b-[2rem]
            shadow-lg
          "
        >

          <h1 className="text-4xl font-black text-white">
            Productos
          </h1>

          <p className="text-green-100 mt-2">
            Catálogo actualizado del almacén
          </p>

          {/* BUSCADOR */}

          <div className="mt-5">

            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              className="
                w-full
                bg-white
                rounded-2xl
                px-5
                py-4
                outline-none
                text-lg
                shadow
              "
            />

          </div>

        </div>

        {/* PRODUCTOS */}

        <div className="p-4 space-y-4 -mt-5">

          {productosFiltrados.map((producto) => (

            <div
              key={producto.id}
              className="
                bg-white
                rounded-3xl
                shadow-lg
                overflow-hidden
              "
            >

              {/* IMAGEN */}

              <div className="h-44 relative">

                <img
                  src={imagenPlaceholder}
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

                <div
                  className="
                    absolute
                    top-3
                    left-3
                    bg-white/90
                    backdrop-blur
                    px-3
                    py-1
                    rounded-xl
                    text-sm
                    font-semibold
                  "
                >
                  {producto.categorias?.icono}
                  {' '}
                  {producto.categorias?.nombre}
                </div>

              </div>

              {/* INFO */}

              <div className="p-5">

                <div className="flex justify-between items-start">

                  <div>

                    <h2 className="text-2xl font-black text-gray-800">
                      {producto.nombre}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Stock: {producto.stock}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-2xl font-black text-green-700">
                      {producto.precio} €
                    </p>

                    <p className="text-sm text-gray-400">
                      / {producto.unidad}
                    </p>

                  </div>

                </div>

                {/* SELECTORES */}

                <div className="grid grid-cols-2 gap-3 mt-5">

                  <select
                    className="
                      bg-gray-100
                      rounded-2xl
                      px-4
                      py-3
                    "
                  >
                    <option>
                      Caja
                    </option>

                    <option>
                      Bolsa
                    </option>

                    <option>
                      Granel
                    </option>

                  </select>

                  <select
                    className="
                      bg-gray-100
                      rounded-2xl
                      px-4
                      py-3
                    "
                  >
                    <option>
                      Normal
                    </option>

                    <option>
                      Premium
                    </option>

                    <option>
                      Extra
                    </option>

                  </select>

                </div>

                {/* CANTIDAD */}

                <div className="mt-4">

                  <input
                    type="number"
                    defaultValue={1}
                    min={1}
                    className="
                      w-full
                      bg-gray-100
                      rounded-2xl
                      px-4
                      py-3
                    "
                  />

                </div>

                {/* BOTÓN */}

                <button

                  onClick={() => {

                    addItem({

                      ...producto,

                      cantidad: 1

                    })

                    alert('Añadido al carrito')

                  }}

                  className="
                    w-full
                    mt-5
                    bg-green-600
                    hover:bg-green-700
                    text-white
                    py-4
                    rounded-2xl
                    font-bold
                    text-lg
                    transition
                  "
                >
                  Añadir al carrito
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