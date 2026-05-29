'use client'

import Link from 'next/link'

type Props = {
  totalProductos: number
  repetirUltimoPedido: () => void
}

export default function AppleActions({
  totalProductos,
  repetirUltimoPedido
}: Props) {

  return (

    <div
      className="
        grid
        grid-cols-2
        gap-3
        mt-6
      "
    >

      {/* REPETIR */}

      <button
        onClick={repetirUltimoPedido}
        className="
          h-[58px]
          rounded-[1.5rem]
          bg-green-700
          text-white
          font-black
          text-[0.98rem]
          shadow-lg
          active:scale-[0.98]
          transition
        "
      >
        Repetir pedido
      </button>

      {/* CARRITO */}

      <Link href="/carrito">

        <button
          className="
           bg-white/75
backdrop-blur-md
border
border-white/40
text-black
          "
        >
          Carrito ({totalProductos})
        </button>

      </Link>

    </div>

  )

}