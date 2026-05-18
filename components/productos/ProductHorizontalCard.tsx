'use client'

import { useState } from 'react'

import { useCartStore } from '@/store/cartStore'

interface Props {
  producto: any
}

export default function ProductHorizontalCard({
  producto
}: Props) {

  const addItem = useCartStore(
    (state) => state.addItem
  )

  const [cantidad, setCantidad] = useState(1)

  const [envase, setEnvase] = useState('Caja')

  const [variedad, setVariedad] = useState('Normal')

  function sumar() {
    setCantidad((prev) => prev + 1)
  }

  function restar() {

    if (cantidad <= 1) return

    setCantidad((prev) => prev - 1)

  }

  return (

    <div
      className="
        bg-white
        rounded-3xl
        shadow-md
        overflow-hidden
        flex
        gap-4
        p-3
      "
    >

      {/* IMAGEN */}

      <div
        className="
          w-28
          h-28
          rounded-2xl
          overflow-hidden
          shrink-0
          relative
        "
      >

        <img
  src={
    producto.imagen_url
    || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200'
  }
  className="
    w-full
    h-full
    object-cover
  "
/>

        <div
          className="
            absolute
            top-2
            left-2
            bg-white/90
            rounded-xl
            px-2
            py-1
            text-xs
            font-bold
          "
        >
          {producto.categorias?.icono}
        </div>

      </div>

      {/* INFO */}

      <div className="flex-1">

        {/* TOP */}

        <div className="flex justify-between">

          <div>

            <h2
              className="
                text-lg
                font-black
                text-gray-800
                leading-tight
              "
            >
              {producto.nombre}
            </h2>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              {producto.stock} disponibles
            </p>

          </div>

          <div className="text-right">

            <p
              className="
                text-xl
                font-black
                text-green-700
              "
            >
              {producto.precio} €
            </p>

            <p className="text-xs text-gray-400">
              / {producto.unidad}
            </p>

          </div>

        </div>

        {/* CHIPS */}

        <div className="flex gap-2 mt-3">

          <select
            value={envase}
            onChange={(e) =>
              setEnvase(e.target.value)
            }
            className="
              bg-gray-100
              rounded-xl
              px-3
              py-2
              text-sm
            "
          >
            <option>Caja</option>
            <option>Bolsa</option>
            <option>Granel</option>
          </select>

          <select
            value={variedad}
            onChange={(e) =>
              setVariedad(e.target.value)
            }
            className="
              bg-gray-100
              rounded-xl
              px-3
              py-2
              text-sm
            "
          >
            <option>Normal</option>
            <option>Premium</option>
            <option>Extra</option>
          </select>

        </div>

        {/* BOTTOM */}

        <div
          className="
            flex
            items-center
            justify-between
            mt-4
          "
        >

          {/* CANTIDAD */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <button
              onClick={restar}
              className="
                w-8
                h-8
                rounded-full
                bg-gray-200
                font-bold
              "
            >
              −
            </button>

            <span className="font-bold">
              {cantidad}
            </span>

            <button
              onClick={sumar}
              className="
                w-8
                h-8
                rounded-full
                bg-gray-200
                font-bold
              "
            >
              +
            </button>

          </div>

          {/* BOTÓN */}

          <button

            onClick={() => {

              addItem({

                ...producto,

                cantidad,

                envase,

                variedad

              })

              alert('Añadido')

            }}

            className="
              bg-green-600
              text-white
              rounded-2xl
              px-4
              py-2
              font-bold
            "
          >
            Añadir
          </button>

        </div>

      </div>

    </div>

  )

}