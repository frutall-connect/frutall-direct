'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

export default function HomePage() {
  const [productos, setProductos] = useState<any[]>([])

  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {
    const { data } = await supabase
      .from('productos')
      .select('*')

    if (data) setProductos(data)
  }

  return (
    <MobileLayout>

      <div className="p-4 pb-24">

        <div className="mb-6">

          <h1 className="text-4xl font-bold text-green-700">
            FrutALL
          </h1>

          <p className="text-gray-600 mt-1">
            ¿Qué necesitas hoy?
          </p>

        </div>

        <input
          placeholder="Buscar productos..."
          className="w-full bg-white rounded-2xl p-4 mb-6 shadow-sm"
        />

        <div className="space-y-4">

          {productos.map((producto) => (

            <div
              key={producto.id}
              className="bg-white rounded-3xl shadow overflow-hidden"
            >

              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-48 object-cover"
              />

              <div className="p-4">

                <div className="flex justify-between items-start">

                  <div>
                    <h2 className="text-xl font-bold">
                      {producto.nombre}
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                      {producto.descripcion}
                    </p>
                  </div>

                  <p className="text-green-700 font-bold text-xl">
                    € {producto.precio}
                  </p>

                </div>

                <button className="mt-4 w-full bg-green-600 text-white py-3 rounded-2xl font-semibold">
                  Añadir
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