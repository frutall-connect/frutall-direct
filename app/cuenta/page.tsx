'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

export default function CuentaPage() {

  const [usuario, setUsuario] =
    useState<any>(null)

  const [rol, setRol] =
    useState('cliente')

  useEffect(() => {

    cargarUsuario()

  }, [])

  async function cargarUsuario() {

    const { data: authData } =
      await supabase.auth.getUser()

    const user = authData.user

    if (!user) {

      window.location.href = '/login'

      return

    }

    setUsuario(user)

    const { data } = await supabase

      .from('perfiles')

      .select('rol')

      .eq('id', user.id)

      .maybeSingle()

    if (data?.rol) {

      setRol(data.rol)

    }

  }

  async function cerrarSesion() {

    await supabase.auth.signOut()

    window.location.href = '/login'

  }

const esAdmin = true

  return (

    <MobileLayout>

      <div className="min-h-screen bg-white pb-32">

        {/* HEADER */}

        <div
          className="
            bg-white
            px-5
            pt-5
            pb-4
            border-b
          "
        >

          <h1
            className="
              text-3xl
              font-black
              text-black
            "
          >
            Mi Cuenta
          </h1>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Gestión de usuario
          </p>

        </div>

        {/* PERFIL */}

        <div className="p-4">

          <div
            className="
              bg-white
              rounded-3xl
              shadow-lg
              p-5
            "
          >

            <p
              className="
                text-sm
                text-gray-500
              "
            >
              Usuario
            </p>

            <h2
              className="
                text-xl
                font-black
                mt-2
                break-all
              "
            >
              {usuario?.email}
            </h2>

            <div
              className={`
                inline-block
                mt-4
                px-4
                py-2
                rounded-full
                text-sm
                font-bold

                ${
                  rol === 'admin'

                    ? 'bg-green-100 text-green-700'

                    : 'bg-gray-100 text-gray-700'
                }
              `}
            >
              {rol}
            </div>

          </div>

        </div>

        {/* ADMIN */}

        {rol === 'admin' && (

          <div className="px-4 space-y-4">

            <Link href="/admin/dashboard">

              <div
                className="
                  bg-black
                  text-white
                  rounded-3xl
                  p-5
                  shadow-lg
                "
              >

                <h2
                  className="
                    text-2xl
                    font-black
                  "
                >
                  Dashboard
                </h2>

                <p
                  className="
                    text-sm
                    opacity-70
                    mt-1
                  "
                >
                  KPIs y métricas
                </p>

              </div>

            </Link>

            <Link href="/admin/productos">

              <div
                className="
                  bg-green-700
                  text-white
                  rounded-3xl
                  p-5
                  shadow-lg
                "
              >

                <h2
                  className="
                    text-2xl
                    font-black
                  "
                >
                  Productos
                </h2>

                <p
                  className="
                    text-sm
                    opacity-80
                    mt-1
                  "
                >
                  Gestión catálogo
                </p>

              </div>

            </Link>

            <Link href="/almacen">

              <div
                className="
                  bg-purple-700
                  text-white
                  rounded-3xl
                  p-5
                  shadow-lg
                "
              >

                <h2
                  className="
                    text-2xl
                    font-black
                  "
                >
                  Almacén
                </h2>

                <p
                  className="
                    text-sm
                    opacity-80
                    mt-1
                  "
                >
                  Gestión pedidos
                </p>

              </div>

            </Link>

          </div>

        )}

{

  esAdmin && (

    <a

      href="/admin"

      className="
        mt-6
        bg-black
        text-white
        rounded-3xl
        p-5
        flex
        items-center
        justify-between
        text-xl
        font-bold
      "

    >

      <span>

        ⚙️ Panel Admin

      </span>

      <span>

        →

      </span>

    </a>

  )

}

        {/* LOGOUT */}

        <div className="p-4">

          <button
            onClick={cerrarSesion}
            className="
              w-full
              bg-red-600
              text-white
              rounded-3xl
              py-4
              font-black
              shadow-lg
            "
          >
            Cerrar sesión
          </button>

        </div>

      </div>

      <BottomNav />

    </MobileLayout>

  )

}