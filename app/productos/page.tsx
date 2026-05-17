'use client'

import { useEffect, useMemo, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

import ProductCard from '@/components/productos/ProductCard'

export default function ProductosPage() {

  const [productos, setProductos] = useState<any[]>([])

  const [busqueda, setBusqueda] = useState('')

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

            <ProductCard
              key={producto.id}
              producto={producto}
            />

          ))}

        </div>

      </div>

      <BottomNav />

    </MobileLayout>

  )

}