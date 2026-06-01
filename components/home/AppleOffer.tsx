'use client'

import { useState, useEffect } from 'react'

import { supabase } from '@/lib/supabaseClient'

export default function AppleOffer() {

  const [ofertas, setOfertas] =
    useState<any[]>([])

  async function cargarOferta() {

  const { data, error } =
  await supabase
    .from('ofertas_home')
    .select(`
      precio_oferta,
      productos (
        id,
        nombre,
        precio,
        imagen
      )
    `)
    .eq('activa', true)

  console.log('OFERTAS:', data)
  console.log('ERROR OFERTAS:', error)

  if (!error && data) {
    setOfertas(data)
  }

}

  useEffect(() => {

    cargarOferta()

  }, [])

  return (

    <div className="mt-6">

      <div
        className="
          flex
          items-center
          justify-between
          mb-3
        "
      >

        <h2
          className="
            text-[1.3rem]
            font-black
            tracking-tight
            text-black
          "
        >
          Ofertas del día
        </h2>

      </div>

      <div
        className="
          flex
          gap-4
          overflow-x-auto
          snap-x
          pb-2
        "
      >

        {ofertas.map((oferta, index) => {

          const descuento =
            Math.round(
              (
                (
                  oferta.productos.precio -
                  oferta.precio_oferta
                )
                /
                oferta.productos.precio
              ) * 100
            )

          return (

            <div
              key={index}
              className="
                min-w-[340px]
                bg-white/60
                backdrop-blur-md
                rounded-[1.4rem]
                p-2
                shadow-sm
                border
                border-white/40
                snap-start
              "
            >

              <div
                className="
                  flex
                  gap-4
                  items-center
                "
              >

                <img
                  src={oferta.productos.imagen}
                  alt={oferta.productos.nombre}
                  className="
                    w-[92px]
                    h-[92px]
                    rounded-[1.4rem]
                    object-cover
                  "
                />

                <div className="flex-1">

                  <div
                    className="
                      inline-flex
                      px-3
                      py-1
                      rounded-full
                      bg-red-500
                      text-white
                      text-[0.7rem]
                      font-black
                    "
                  >
                    -{descuento}%
                  </div>

                  <h3
                    className="
                      text-[1.05rem]
                      leading-[1.2rem]
                      font-black
                      mt-1
                      text-black
                    "
                  >
                    {oferta.productos.nombre}
                  </h3>

                  <div
                    className="
                      flex
                      items-end
                      gap-2
                      mt-1
                    "
                  >

                    <span
                      className="
                        text-[1.4rem]
                        font-black
                        text-green-700
                      "
                    >
                      {Number(
                        oferta.precio_oferta
                      ).toFixed(2)}€
                    </span>

                    <span
                      className="
                        text-gray-400
                        line-through
                        text-[0.9rem]
                      "
                    >
                      {Number(
                        oferta.productos.precio
                      ).toFixed(2)}€
                    </span>

                  </div>

                </div>

              </div>

            </div>

          )

        })}

      </div>

    </div>

  )

}