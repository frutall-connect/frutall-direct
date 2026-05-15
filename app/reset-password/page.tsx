'use client'

import { useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

export default function ResetPasswordPage() {

  const [password, setPassword] = useState('')

  async function actualizarPassword() {

    const { error } =
      await supabase.auth.updateUser({

        password

      })

    if (error) {

      alert(error.message)

      return
    }

    alert('Contraseña actualizada')

    window.location.href = '/login'

  }

  return (

    <main className="min-h-screen bg-[#f5f3eb] flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Nueva contraseña
        </h1>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-2xl bg-gray-100 mb-4"
        />

        <button
          onClick={actualizarPassword}
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold"
        >
          Actualizar contraseña
        </button>

      </div>

    </main>

  )

}