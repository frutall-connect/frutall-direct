'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function HomePage() {
  const [productos, setProductos] = useState<any[]>([])

  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')

    if (!error && data) {
      setProductos(data)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f3eb] p-4">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        FrutALL Direct
      </h1>

      <div className="space-y-4">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-2xl shadow p-4 flex gap-4"
          >
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-24 h-24 rounded-xl object-cover"
            />

            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {producto.nombre}
              </h2>

              <p className="text-gray-500 text-sm">
                {producto.descripcion}
              </p>

              <p className="text-green-700 font-bold text-lg mt-2">
                € {producto.precio}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}