'use client'

import { useEffect, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'
import HamburgerMenu from '@/components/layout/HamburgerMenu'

import { supabase } from '@/lib/supabaseClient'

const imagenes: Record<string, string> = {

  Frutas:
    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=1200',

  Verduras:
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200',

  Tubérculos:
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=1200',

  Temporada:
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=1200'

}

export default function InicioPage() {

  const [categorias, setCategorias] = useState<any[]>([])

  useEffect(() => {
    cargarCategorias()
  }, [])

  async function cargarCategorias() {

    const { data, error } = await supabase
      .from('categorias')
      .select('*')

    if (!error && data) {
      setCategorias(data)
    }

  }

  return (

    <MobileLayout title="Inicio">

      <div className="pb-28">

        {/* HEADER */}

        <div
          className="
            bg-gradient-to-b
            from-green-700
            to-green-600
            text-white
            px-5
            pt-6
            pb-8
            rounded-b-[2rem]
            shadow-lg
          "
        >

          <div className="flex justify-between items-start">

            <div>

              <h1 className="text-4xl font-black">
                FrutALL
              </h1>

              <p className="mt-4 text-2xl font-bold">
                ¿Qué necesitas hoy?
              </p>

              <p className="text-green-100 mt-1">
                Productos frescos directos del almacén
              </p>

            </div>

            <HamburgerMenu />

          </div>

        </div>

        {/* CATEGORÍAS */}

        <div className="p-4 grid grid-cols-2 gap-4 -mt-6">

          {categorias.map((categoria) => (

            <div
              key={categoria.id}
              className="
                relative
                rounded-3xl
                overflow-hidden
                shadow-xl
                h-44
              "
            >

              <img
                src={
                  imagenes[categoria.nombre]
                  || imagenes.Frutas
                }
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-black/35
                "
              />

              <div
                className="
                  relative
                  h-full
                  flex
                  flex-col
                  justify-end
                  p-4
                  text-white
                "
              >

                <div className="text-3xl">
                  {categoria.icono}
                </div>

                <h2 className="text-2xl font-bold mt-2">
                  {categoria.nombre}
                </h2>

              </div>

            </div>

          ))}

        </div>

        {/* OFERTA */}

        <div className="px-4 mt-2">

          <div
            className="
              bg-white
              rounded-3xl
              shadow-lg
              p-5
            "
          >

            <div className="flex justify-between items-center">

              <div>

                <p className="text-sm text-gray-400">
                  Oferta destacada
                </p>

                <h3 className="text-2xl font-black text-green-700">
                  Tomate Rama
                </h3>

                <p className="text-gray-600 mt-1">
                  1,99 €/kg
                </p>

              </div>

              <div className="text-5xl">
                🍅
              </div>

            </div>

          </div>

        </div>

      </div>

      <BottomNav />

    </MobileLayout>

  )

}