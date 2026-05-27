'use client'

import {
  Suspense,
  useEffect,
  useMemo,
  useState
} from 'react'

import Link from 'next/link'

import { useSearchParams } from 'next/navigation'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

import { useCartStore } from '@/store/cartStore'

import ProductHorizontalCard from '@/components/productos/ProductHorizontalCard'

export default function ProductosPage() {

  return (
    <Suspense>
      <ProductosContenido />
    </Suspense>
  )

}

function ProductosContenido() {

  const [productos, setProductos] =
    useState<any[]>([])

  const [busqueda, setBusqueda] =
    useState('')

  const searchParams =
    useSearchParams()

  const categoriaActual =
    searchParams.get('categoria')

  const items = useCartStore(
    (state) => state.items
  )

  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {

    const { data, error } =
      await supabase

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

    return productos.filter((producto) => {

      const coincideBusqueda =

        producto.nombre
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          )

      const coincideCategoria =

        categoriaActual

          ? producto.categorias?.nombre
              ?.toLowerCase() ===
            categoriaActual.toLowerCase()

          : true

      return (
        coincideBusqueda &&
        coincideCategoria
      )

    })

  }, [
    productos,
    busqueda,
    categoriaActual
  ])

  const totalProductos = items.reduce(

    (acc, item) =>

      acc + item.cantidad,

    0

  )

  const totalImporte = items.reduce(

    (acc, item) =>

      acc + item.precio * item.cantidad,

    0

  )

  return (

    <MobileLayout>

      <div className="min-h-screen bg-[#f5f3eb] pb-44">

        {/* HEADER */}

        <div
          className="
            bg-white
            px-5
            pt-5
            pb-4
            border-b
            sticky
            top-0
            z-40
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <h1
                className="
                  text-3xl
                  font-black
                  text-black
                "
              >
                Productos
              </h1>

              <p
                className="
                  text-sm
                  text-gray-500
                  mt-1
                "
              >
                Catálogo actualizado
              </p>

            </div>

            <Link href="/carrito">

              <button
                className="
                  bg-green-600
                  text-white
                  rounded-2xl
                  px-4
                  py-3
                  font-bold
                "
              >
                🛒 {totalProductos}
              </button>

            </Link>

          </div>

          {/* BUSCADOR */}

          <div className="mt-4">

            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              className="
                w-full
                bg-[#f5f3eb]
                rounded-2xl
                px-5
                py-4
                outline-none
                text-base
              "
            />

          </div>

          {/* FILTROS */}

          <div
            className="
              flex
              gap-2
              overflow-x-auto
              mt-4
              pb-1
            "
          >

            <Link
              href="/productos"
              className="
                bg-green-700
                text-white
                rounded-full
                px-4
                py-2
                text-sm
                font-semibold
                whitespace-nowrap
                inline-flex
                items-center
              "
            >
              Todos
            </Link>

            <Link
              href="/productos?categoria=Frutas"
              className="
                bg-white
                rounded-full
                px-4
                py-2
                text-sm
                font-semibold
                whitespace-nowrap
                inline-flex
                items-center
              "
            >
              🍎 Frutas
            </Link>

            <Link
              href="/productos?categoria=Verduras"
              className="
                bg-white
                rounded-full
                px-4
                py-2
                text-sm
                font-semibold
                whitespace-nowrap
                inline-flex
                items-center
              "
            >
              🥦 Verduras
            </Link>

            <Link
              href="/productos?categoria=Tubérculos"
              className="
                bg-white
                rounded-full
                px-4
                py-2
                text-sm
                font-semibold
                whitespace-nowrap
                inline-flex
                items-center
              "
            >
              ⭐ Tubérculos
            </Link>

          </div>

        </div>

        {/* PRODUCTOS */}

        <div className="p-4 space-y-4">

          {productosFiltrados.map((producto) => (

            <ProductHorizontalCard
              key={producto.id}
              producto={producto}
            />

          ))}

        </div>

        {/* BARRA FLOTANTE */}

        {items.length > 0 && (

          <div
            className="
              fixed
              bottom-24
              left-1/2
              -translate-x-1/2
              w-[92%]
              max-w-md
              z-50
            "
          >

            <Link href="/carrito">

              <div
                className="
                  bg-green-700
                  text-white
                  rounded-3xl
                  shadow-2xl
                  px-5
                  py-4
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p className="text-sm text-green-100">
                    {totalProductos} productos
                  </p>

                  <p className="font-black text-xl">
                    {totalImporte.toFixed(2)} €
                  </p>

                </div>

                <button
                  className="
                    bg-white
                    text-green-700
                    px-5
                    py-3
                    rounded-2xl
                    font-black
                  "
                >
                  Ver carrito
                </button>

              </div>

            </Link>

          </div>

        )}

      </div>

      <BottomNav />

    </MobileLayout>

  )

}