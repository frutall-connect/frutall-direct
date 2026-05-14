'use client'

import { useEffect, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

export default function ProductosPage() {

  const [productos, setProductos] = useState<any[]>([])

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

  return (

    <MobileLayout title="Productos">

      <div className="p-4 pb-24 space-y-4">

        <div>

          <h2 className="text-3xl font-bold text-green-800">
            Productos
          </h2>

          <p className="text-gray-500 mt-2">
            Catálogo actualizado del almacén.
          </p>

        </div>

        {productos.map((producto) => (

          <div
            key={producto.id}
            className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4"
          >

            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{
                background: producto.categorias?.color || '#eee'
              }}
            >
              {producto.categorias?.icono}
            </div>

            <div className="flex-1">

              <h3 className="font-bold text-lg">
                {producto.nombre}
              </h3>

              <p className="text-gray-500">
                {producto.precio} € / {producto.unidad}
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Stock: {producto.stock}
              </p>

            </div>

            <button
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold"
            >
              +
            </button>

          </div>

        ))}

      </div>

      <BottomNav />

    </MobileLayout>

  )

}