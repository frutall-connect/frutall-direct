'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

export default function AdminGuard({
  children
}: {
  children: React.ReactNode
}) {

  const [loading, setLoading] =
    useState(true)

  const [permitido, setPermitido] =
    useState(false)

  useEffect(() => {

    verificar()

  }, [])

  async function verificar() {

    const { data: authData } =
      await supabase.auth.getUser()

    const usuario = authData.user

    if (!usuario) {

      window.location.href = '/login'

      return

    }

    const { data } = await supabase

      .from('perfiles')

      .select('rol')

      .eq('id', usuario.id)

      .single()

    if (
      data?.rol === 'admin'
    ) {

      setPermitido(true)

    } else {

      window.location.href = '/'

    }

    setLoading(false)

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

  if (!permitido) return null

  return children

}