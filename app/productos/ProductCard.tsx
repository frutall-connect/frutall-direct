'use client'

import { useState } from 'react'

import { useCartStore } from '@/store/cartStore'

const imagenPlaceholder =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200'

interface Props {
  producto: any
}

export default function ProductCard({
  producto
}: Props) {

  const addItem = useCartStore(
    (state) => state.addItem
  )

  const [cantidad, setCantidad] = useState(1)

  const [envase, setEnvase] = useState('Caja')

  const [variedad, setVariedad] = useState('Normal')

  return (

    <div
      className="
        bg-white
        rounded-3xl
        shadow-lg
        overflow-hidden
      "
    >

      {/* IMAGEN */}

      <div className="h-44 relative">

        <img
          src={imagenPlaceholder}
          className="
            w-full
            h-full
            object-cover
          "
        />

        <div
          className="
            absolute
            top-3
            left-3
            bg-white/90
            backdrop-blur
            px-3
            py-1
            rounded-xl
            text-sm
            font-semibold
          "
        >
          {producto.categorias?.icono}
          {' '}
          {producto.categorias?.nombre}
        </div>

      </div>

      {/* INFO */}

      <div className="p-5">

        <div className="flex justify-between items-start">

          <div>

            <h2 className="text-2xl font-black text-gray-800">
              {producto.nombre}
            </h2>

            <p className="text-gray-500 mt-1">
              Stock: {producto.stock}
            </p>

          </div>

          <div className="text-right">

            <p className="text-2xl font-black text-green-700">
              {producto.precio} €
            </p>

            <p className="text-sm text-gray-400">
              / {producto.unidad}
            </p>

          </div>

        </div>

        {/* SELECTORES */}

        <div className="grid grid-cols-2 gap-3 mt-5">

          <select
            value={envase}
            onChange={(e) =>
              setEnvase(e.target.value)
            }
            className="
              bg-gray-100
              rounded-2xl
              px-4
              py-3
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
              rounded-2xl
              px-4
              py-3
            "
          >
            <option>Normal</option>
            <option>Premium</option>
            <option>Extra</option>
          </select>

        </div>

        {/* CANTIDAD */}

        <div className="mt-4">

          <input
            type="number"
            value={cantidad}
            min={1}
            onChange={(e) =>
              setCantidad(Number(e.target.value))
            }
            className="
              w-full
              bg-gray-100
              rounded-2xl
              px-4
              py-3
            "
          />

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

            alert('Añadido al carrito')

          }}

          className="
            w-full
            mt-5
            bg-green-600
            hover:bg-green-700
            text-white
            py-4
            rounded-2xl
            font-bold
            text-lg
            transition
          "
        >
          Añadir al carrito
        </button>

      </div>

    </div>

  )

}