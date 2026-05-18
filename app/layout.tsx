'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

import { useCartStore } from '@/store/cartStore'

export default function InicioPage() {

  const [categorias, setCategorias] = useState<any[]>([])

  const [usuario, setUsuario] = useState('')

  const items = useCartStore(
    (state) => state.items
  )

  useEffect(() => {

    cargarCategorias()

    cargarUsuario()

  }, [])

  async function cargarUsuario() {

    const { data } =
      await supabase.auth.getUser()

    const email =
      data.user?.email || ''

    const nombre =
      email.split('@')[0]

    setUsuario(nombre)

  }

  async function cargarCategorias() {

    const { data, error } = await supabase

      .from('categorias')

      .select('*')

    if (!error && data) {
      setCategorias(data)
    }

  }

  const totalProductos = items.reduce(

    (acc, item) =>

      acc + item.cantidad,

    0

  )

  return (

    <MobileLayout>

      <div className="min-h-screen bg-[#f5f3eb] pb-32">

        {/* HEADER */}

        <div
          className="
            bg-white
            px-5
            pt-8
            pb-5
            border-b
          "
        >

          {/* LOGO */}

          <div className="flex justify-center">

            <Image
              src="/logo-frutall-direct.png"
              alt="FrutALL Direct"
              width={320}
              height={90}
              priority
            />

          </div>

        </div>

        {/* CONTENIDO */}

        <div className="px-5 pt-6">

          {/* BIENVENIDA */}

          <div>

            <h2 className="text-2xl font-bold text-black">

              Bienvenido,

              <span className="text-green-700">
                {' '}
                {usuario}
              </span>

            </h2>

            <h1
              className="
                text-5xl
                leading-tight
                font-black
                text-black
                mt-3
              "
            >
              ¿Qué necesitas hoy?
            </h1>

          </div>

          {/* CATEGORÍAS */}

          <div className="grid grid-cols-2 gap-4 mt-8">

            {categorias.map((categoria) => (

              <Link
                href="/productos"
                key={categoria.id}
              >

                <div
                  className="
                    relative
                    rounded-3xl
                    overflow-hidden
                    shadow-lg
                    h-44
                    flex
                    items-end
                    p-5
                  "
                  style={{
                    background: categoria.color
                  }}
                >

                  {/* ICONO */}

                  <div
                    className="
                      absolute
                      top-4
                      left-4
                      text-6xl
                    "
                  >
                    {categoria.icono}
                  </div>

                  {/* TEXTO */}

                  <div
                    className="
                      w-full
                      flex
                      justify-between
                      items-end
                    "
                  >

                    <span
                      className="
                        text-white
                        text-2xl
                        font-black
                        leading-tight
                      "
                    >
                      {categoria.nombre}
                    </span>

                    <span
                      className="
                        text-white
                        text-4xl
                        font-light
                      "
                    >
                      ›
                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>

          {/* OFERTA */}

          <div className="mt-10">

            <div
              className="
                flex
                items-center
                justify-between
                mb-4
              "
            >

              <h3
                className="
                  text-4xl
                  font-black
                  text-black
                "
              >
                Ofertas Especiales
              </h3>

              <span
                className="
                  text-green-700
                  text-5xl
                  font-light
                "
              >
                »
              </span>

            </div>

            <div
              className="
                bg-white
                rounded-3xl
                p-4
                shadow-lg
                flex
                gap-4
                items-center
              "
            >

              {/* IMAGEN */}

              <div
                className="
                  w-28
                  h-28
                  rounded-2xl
                  overflow-hidden
                  shrink-0
                "
              >

                <img
                  src="https://images.unsplash.com/photo-1515778767554-1951c1d0b119?q=80&w=1200"
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

              </div>

              {/* INFO */}

              <div className="flex-1">

                <h4
                  className="
                    text-2xl
                    font-black
                    text-green-800
                  "
                >
                  Uva Roja Sin Semilla
                </h4>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mt-3
                  "
                >

                  <span
                    className="
                      text-4xl
                      font-black
                    "
                  >
                    1,80 €/kg
                  </span>

                  <span
                    className="
                      text-green-700
                      text-xl
                      font-semibold
                    "
                  >
                    ✓ Disponible
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* BOTONES */}

          <div className="grid grid-cols-2 gap-4 mt-8">

            <button
              className="
                bg-green-700
                text-white
                rounded-2xl
                py-5
                text-xl
                font-bold
                shadow-lg
              "
            >
              🔄 Repetir Último Pedido
            </button>

            <Link href="/carrito">

              <button
                className="
                  w-full
                  bg-green-700
                  text-white
                  rounded-2xl
                  py-5
                  text-xl
                  font-bold
                  shadow-lg
                "
              >
                🛒 Carrito ({totalProductos})
              </button>

            </Link>

          </div>

        </div>

      </div>

      <BottomNav />

    </MobileLayout>

  )

}