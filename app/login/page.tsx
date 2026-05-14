'use client'

import { useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  async function login() {

    const { error } = await supabase.auth.signInWithPassword({

      email,
      password

    })

    if (error) {

      alert(error.message)

      return
    }

    alert('Login correcto')

    window.location.href = '/'

  }

  async function register() {

    const { error } = await supabase.auth.signUp({

      email,
      password

    })

    if (error) {

      alert(error.message)

      return
    }

    alert('Cuenta creada')

  }

  return (

    <main className="min-h-screen bg-[#f5f3eb] flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">

        <h1 className="text-4xl font-bold text-green-700 mb-2">
          FrutALL
        </h1>

        <p className="text-gray-500 mb-8">
          Accede a tu cuenta
        </p>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-2xl bg-gray-100"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-2xl bg-gray-100"
          />

          <button
            onClick={login}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold"
          >
            Entrar
          </button>

          <button
            onClick={register}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold"
          >
            Crear cuenta
          </button>

        </div>

      </div>

    </main>

  )

}