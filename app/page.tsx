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

    const { data, error } = await supabase

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

    const { data: pedido } = await supabase

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

      alert('No tienes pedidos anteriores')

      return

    }

    const nuevosItems = pedido.lineas_pedido.map(
      (linea: any) => ({

        id: linea.producto_id,

        nombre: linea.nombre_producto,

        precio: linea.precio,

        cantidad: linea.cantidad,

        envase: linea.envase || 'Caja',

        variedad: linea.variedad || 'Normal'

      })
    )

    setItems(nuevosItems)

    alert('Pedido cargado en carrito')

    window.location.href = '/carrito'

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
            pt-3
            pb-2
            border-b
          "
        >

          <div className="flex justify-center">

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

          {/* BIENVENIDA */}

          <div>

            <h2 className="text-lg font-bold text-black">

              Bienvenido,

              <span className="text-green-700">
                {' '}
                {usuario}
              </span>

            </h2>

            <div
  className="
    relative
    overflow-hidden
    rounded-3xl
    bg-gradient-to-br
    from-green-800
    via-green-700
    to-emerald-500
    px-6
    pt-4
    pb-4
    shadow-xl
  "
>

  <div className="max-w-md">

    <div
      className="
        flex
        gap-3
        mt-2
      "
    >
      <Link href="/productos">

        <button
          className="
            bg-white
            text-green-800
            px-5
            py-3
            rounded-2xl
            font-black
            shadow-lg
          "
        >
          Ver catálogo
        </button>

      </Link>

      <button
        className="
          bg-white/15
          backdrop-blur
          border
          border-white/20
          text-white
          px-5
          py-3
          rounded-2xl
          font-bold
        "
      >
        Ofertas
      </button>

    </div>

  </div>

</div>

          </div>

          {/* CATEGORÍAS */}

          <div className="grid grid-cols-2 gap-4 mt-6">

            {categorias.map((categoria) => (

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
    background: categoria.color
  }}
>

  {/* BRILLO */}

  <div
    className="
      absolute
      inset-0
      bg-gradient-to-br
      from-white/20
      to-transparent
      pointer-events-none
    "
  />

  {/* ICONO */}

  <div
    className="
      text-2xl
      z-10
    "
  >
    {categoria.icono}
  </div>

  {/* TEXTO */}

  <div
    className="
      flex
      items-center
      
      z-10
    "
  >

    <span
      className="
        text-white
        text-base
        font-black
        tracking-tight
      "
    >
      {categoria.nombre}
    </span>

    <span
      className="
        text-white
        text-2xl
        font-light
      "
    >
      →
    </span>

  </div>

</div>

              </Link>

            ))}

          </div>

          {/* OFERTAS */}

          <div className="mt-5">

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
                  text-black
                "
              >
                Ofertas Especiales
              </h3>

              <span
                className="
                  text-green-700
                  text-4xl
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
                p-3
                shadow-lg
                flex
                gap-4
                items-center
              "
            >

              <div
                className="
                  w-20
                  h-20
                  rounded-2xl
                  overflow-hidden
                  shrink-0
                "
              >

                <img

  src="
https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=1200&auto=format&fit=crop
"

  alt="Oferta especial"

  className="
    w-20
    h-20
    object-cover
    rounded-xl
  "

/>

              </div>

              <div className="flex-1">

                <h4
                  className="
                    text-xl
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
                    gap-2
                    mt-2
                    flex-wrap
                  "
                >

                  <span
                    className="
                      text-2xl
                      font-black
                    "
                  >
                    1,80 €/kg
                  </span>

                  <span
                    className="
                      text-green-700
                      text-sm
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

          <div className="grid grid-cols-2 gap-4 mt-4">

            <button
              onClick={repetirUltimoPedido}
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