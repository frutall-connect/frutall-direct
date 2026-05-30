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
    w-full
    h-[54px]
    rounded-[1.4rem]
    bg-white/60
    backdrop-blur-md
    text-green-700
    text-[1rem]
    font-black
    shadow-xl
  "
>
          Carrito ({totalProductos})
        </button>

      </Link>

    </div>

  )

}