'use client'

import { useEffect, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'
import HamburgerMenu from '@/components/layout/HamburgerMenu'

import { supabase } from '@/lib/supabaseClient'

export default function InicioPage() {

  const [categorias, setCategorias] = useState<any[]>([])

  const [user, setUser] = useState<any>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {

    comprobarUsuario()

    cargarCategorias()

  }, [])

  async function comprobarUsuario() {

    const { data } = await supabase.auth.getUser()

    if (!data.user) {

      window.location.href = '/login'

      return
    }

    setUser(data.user)

    setLoading(false)

  }

  async function cargarCategorias() {

    const { data, error } = await supabase
      .from('categorias')
      .select('*')

    if (!error && data) {
      setCategorias(data)
    }

  }

  if (loading) {

    return (

      <main className="min-h-screen bg-[#f5f3eb] flex items-center justify-center">

        <p className="text-gray-500">
          Cargando...
        </p>

      </main>

    )

  }

  return (

    <MobileLayout title="Bienvenido">

      <div className="p-4 pb-24 space-y-6">

        <div className="flex items-start justify-between">

  <div>

    <h2 className="text-3xl font-bold text-green-800">
      Bienvenido
    </h2>

    <p className="text-gray-600 mt-2 text-lg font-semibold">
      ¿Qué necesitas hoy?
    </p>

    <p className="text-gray-500 mt-1">
      Productos frescos directos del almacén.
    </p>

  </div>

  <HamburgerMenu />

</div>

        <div className="grid grid-cols-2 gap-4">

          {categorias.map((categoria) => (

            <div
              key={categoria.id}
              className="rounded-2xl p-6 text-white font-bold text-xl shadow-lg"
              style={{
                background: categoria.color
              }}
            >

              <div className="text-2xl">
                {categoria.icono}
              </div>

              <div className="mt-4">
                {categoria.nombre}
              </div>

            </div>

          ))}

        </div>

      </div>

      <BottomNav />

    </MobileLayout>

  )

}