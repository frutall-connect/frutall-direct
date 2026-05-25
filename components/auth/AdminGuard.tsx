'use client'

import { useEffect, useState }
  from 'react'

import { supabase }
  from '@/lib/supabaseClient'

export default function AdminGuard({

  children,

  allow = ['admin']

}: {

  children: React.ReactNode

  allow?: string[]

}) {

  const [loading, setLoading] =
    useState(true)

  const [permitido, setPermitido] =
    useState(false)

  useEffect(() => {

    verificar()

  }, [])

  async function verificar() {

    try {

      const { data: authData } =
        await supabase.auth.getUser()

      const usuario =
        authData.user

      console.log(
        'USUARIO:',
        usuario
      )

      if (!usuario) {

        window.location.href =
          '/login'

        return

      }

      const {
        data,
        error
      } = await supabase

        .from('perfiles')

        .select('*')

        .eq('id', usuario.id)

        .maybeSingle()

      console.log(
        'PERFIL:',
        data
      )

      console.log(
        'ERROR:',
        error
      )

      if (

        data?.rol

        &&

        allow.includes(
          data.rol
        )

      ) {

        setPermitido(true)

      } else {

        alert(
          'No tienes permisos'
        )

        window.location.href =
          '/'

      }

    } catch (error) {

      console.error(error)

      window.location.href =
        '/'

    } finally {

      setLoading(false)

    }

  }

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
      >

        Cargando...

      </div>

    )

  }

  if (!permitido)
    return null

  return children

}