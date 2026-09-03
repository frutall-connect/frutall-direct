'use client'

import {

  useEffect,
  useState

} from 'react'

import {

  supabase

} from '@/lib/supabaseClient'

import AdminGuard
  from '@/components/auth/AdminGuard'

export default function TarifasPage() {

  const [tarifas, setTarifas] =
    useState<any[]>([])

  useEffect(() => {

    cargar()

  }, [])

  async function cargar() {

    const { data } =
      await supabase

        .from(
          'tarifas_proveedor'
        )

        .select('*')

        .order(
          'fecha',
          {
            ascending: false
          }
        )

    setTarifas(data || [])

  }

  return (

    <AdminGuard
      allow={[
        'admin',
        'almacen'
      ]}
    >

    <main
      className="
        min-h-screen
        bg-white
        p-6
      "
    >

      <h1
        className="
          text-4xl
          font-black
          mb-8
        "
      >

        Tarifas importadas

      </h1>

      <div
        className="
          space-y-4
        "
      >

        {tarifas.map(
          (t) => (

            <div

              key={t.id}

              className="
                bg-white
                rounded-3xl
                p-5
                shadow-lg
              "
            >

              <p
                className="
                  font-bold
                "
              >

                💰 {t.precio_compra}€

              </p>

              <p
                className="
                  text-sm
                  mt-2
                  opacity-70
                "
              >

                {t.proveedor}

              </p>

              <pre
                className="
                  mt-4
                  text-xs
                  overflow-auto
                "
              >

                {t.observaciones}

              </pre>

            </div>

          )
        )}

      </div>

    </main>

    </AdminGuard>

  )

}