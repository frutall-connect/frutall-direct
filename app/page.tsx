'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import MobileLayout from '@/components/layout/MobileLayout'

import BottomNav from '@/components/layout/BottomNav'

import PremiumHero from '@/components/home/PremiumHero'

import { supabase } from '@/lib/supabaseClient'

import { useCartStore } from '@/store/cartStore'

export default function InicioPage() {

  const [categorias, setCategorias] =
    useState<any[]>([])

  const [usuario, setUsuario] =
    useState('')

  const items = useCartStore(
    (state) => state.items
  )

  const setItems = useCartStore(
    (state) => state.setItems
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

    const { data, error } =
      await supabase
        .from('categorias')
        .select('*')

    if (!error && data) {
      setCategorias(data)
    }

  }

  async function repetirUltimoPedido() {

    const { data: authData } =
      await supabase.auth.getUser()

    const usuario = authData.user

    if (!usuario) return

    const { data: pedido } =
      await supabase

        .from('pedidos')

        .select(`
          *,
          lineas_pedido (*)
        `)

        .eq('usuario_id', usuario.id)

        .order('created_at', {
          ascending: false
        })

        .limit(1)

        .single()

    if (!pedido) {

      alert(
        'No tienes pedidos anteriores'
      )

      return

    }

    const nuevosItems =
      pedido.lineas_pedido.map(
        (linea: any) => ({

          id: linea.producto_id,

          nombre:
            linea.nombre_producto,

          precio: linea.precio,

          cantidad:
            linea.cantidad,

          envase:
            linea.envase || 'Caja',

          variedad:
            linea.variedad || 'Normal'

        })
      )

    setItems(nuevosItems)

    alert(
      'Pedido cargado en carrito'
    )

    window.location.href =
      '/carrito'

  }

  const totalProductos =
    items.reduce(

      (acc, item) =>
        acc + item.cantidad,

      0

    )

  return (

    <MobileLayout>

      <div
        className="
          min-h-screen
          bg-[#f5f3eb]
          pb-32
        "
      >

        {/* HEADER */}

        <div
          className="
            bg-white
            border-b
            px-5
            pt-3
            pb-2
          "
        >

          <div
            className="
              flex
              justify-center
            "
          >

            <Image
              src="/logo-frutall-direct.png"
              alt="FrutALL Direct"
              width={180}
              height={70}
              priority
              className="h-14"
            />

          </div>

        </div>

        {/* CONTENIDO */}

        <div className="px-5 pt-5">

          {/* HERO */}

<PremiumHero usuario={usuario} />

          {/* CATEGORÍAS */}

          <div
            className="
              grid
              grid-cols-2
              gap-4
              mt-6
            "
          >

            {categorias.map(
              (categoria) => (

                <Link
                  href={`/productos?categoria=${categoria.nombre}`}
                  key={categoria.id}
                >

                  <div
                    className="
                      relative
                      rounded-[2rem]
                      overflow-hidden
                      shadow-xl
                      h-24
                      p-3
                      flex
                      flex-col
                      justify-between
                      transition
                      active:scale-[0.98]
                    "
                    style={{
                      background:
                        categoria.color
                    }}
                  >

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-br
                        from-white/20
                        to-transparent
                      "
                    />

                    <div
                      className="
                        text-2xl
                        z-10
                      "
                    >
                      {categoria.icono}
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        z-10
                      "
                    >

                      <span
                        className="
                          text-white
                          text-base
                          font-black
                        "
                      >
                        {categoria.nombre}
                      </span>

                      <span
                        className="
                          text-white
                          text-2xl
                        "
                      >
                        →
                      </span>

                    </div>

                  </div>

                </Link>

              )
            )}

          </div>

          {/* OFERTA */}

          <div className="mt-6">

            <div
              className="
                flex
                items-center
                justify-between
                mb-3
              "
            >

              <h3
                className="
                  text-2xl
                  font-black
                "
              >
                Ofertas Especiales
              </h3>

              <span
                className="
                  text-green-700
                  text-4xl
                "
              >
                »
              </span>

            </div>

            <div
              className="
                relative
                overflow-hidden
                rounded-[2rem]
                bg-gradient-to-br
                from-white
                to-green-50
                p-4
                shadow-xl
                border
                border-green-100
              "
            >

              <div
                className="
                  absolute
                  top-3
                  right-3
                  bg-red-500
                  text-white
                  text-xs
                  font-black
                  px-3
                  py-1
                  rounded-full
                "
              >
                -20%
              </div>

              <div
                className="
                  flex
                  gap-4
                  items-center
                "
              >

                <img
                  src="https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=1200&auto=format&fit=crop"
                  alt="Oferta"
                  className="
                    w-24
                    h-24
                    rounded-[1.5rem]
                    object-cover
                    shadow-md
                  "
                />

                <div className="flex-1">

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-wider
                      text-green-700
                      font-bold
                    "
                  >
                    Oferta del día
                  </p>

                  <h4
                    className="
                      text-xl
                      font-black
                      leading-tight
                      mt-1
                    "
                  >
                    Uva Roja Sin Semilla
                  </h4>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      mt-3
                    "
                  >

                    <span
                      className="
                        text-3xl
                        font-black
                        text-green-800
                      "
                    >
                      1,80€
                    </span>

                    <span
                      className="
                        text-sm
                        text-gray-400
                        line-through
                      "
                    >
                      2,30€
                    </span>

                  </div>

                  <div
                    className="
                      mt-2
                      text-sm
                      text-green-700
                      font-semibold
                    "
                  >
                    ✓ Disponible hoy
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* BOTONES */}

          <div
            className="
              grid
              grid-cols-2
              gap-4
              mt-6
            "
          >

            <button
              onClick={
                repetirUltimoPedido
              }
              className="
                bg-green-700
                text-white
                rounded-2xl
                py-3
                text-base
                font-bold
                shadow-lg
              "
            >
              🔄 Repetir Pedido
            </button>

            <Link href="/carrito">

              <button
                className="
                  w-full
                  bg-green-700
                  text-white
                  rounded-2xl
                  py-3
                  text-base
                  font-bold
                  shadow-lg
                "
              >
                🛒 Carrito (
                {totalProductos}
                )
              </button>

            </Link>

          </div>

        </div>

      </div>

      <BottomNav />

    </MobileLayout>

  )

}