'use client'

import Link from 'next/link'

export default function PedidoExitoPage() {

  return (

    <main
      className="
        min-h-screen
        bg-white
        flex
        items-center
        justify-center
        p-6
      "
    >

      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl
          p-10
          max-w-md
          w-full
          text-center
        "
      >

        <div className="text-7xl">
          ✅
        </div>

        <h1
          className="
            text-4xl
            font-black
            text-green-700
            mt-4
          "
        >
          Pedido realizado
        </h1>

        <p
          className="
            text-gray-500
            mt-4
            text-lg
          "
        >
          Tu pago se ha realizado
          correctamente.
        </p>

        <Link
          href="/pedidos"
          className="
            block
            mt-8
            bg-green-600
            hover:bg-green-700
            text-white
            py-4
            rounded-2xl
            font-black
            text-lg
          "
        >
          Ver mis pedidos
        </Link>

        <Link
          href="/"
          className="
            block
            mt-4
            bg-black
            hover:bg-gray-900
            text-white
            py-4
            rounded-2xl
            font-black
            text-lg
          "
        >
          Volver al inicio
        </Link>

      </div>

    </main>

  )

}