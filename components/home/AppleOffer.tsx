'use client'

import { useState, useEffect } from 'react'

import { supabase } from '@/lib/supabaseClient'

import { useCartStore } from '@/store/cartStore'

export default function AppleOffer() {

  const addItem = useCartStore(
    (state) => state.addItem
  )

  const [mostrarToast, setMostrarToast] =
    useState(false)

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

  if (!error && data) {
    setOfertas(data)
  }

}
useEffect(() => {

  cargarOferta()

}, [])

  function agregarOferta() {

  if (!oferta) return

  addItem({

    id: oferta.productos.id,

    nombre: oferta.productos.nombre,

    precio: oferta.precio_oferta,

    cantidad: 1,

    envase: 'Caja',

    variedad: 'Normal'

  })

  setMostrarToast(true)

  setTimeout(() => {

    setMostrarToast(false)

  }, 2000)

}

const descuento =
  oferta
    ? Math.round(
        (
          (oferta.productos.precio -
            oferta.precio_oferta)
          /
          oferta.productos.precio
        ) * 100
      )
    : 0

  return (

    <div className="mt-6">

      {/* TITULO */}

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
          Oferta del día
        </h2>

{mostrarToast && (

  <div
    className="
      fixed
      bottom-28
      left-1/2
      -translate-x-1/2
      z-[999]
      bg-green-700
      text-white
      px-5
      py-3
      rounded-2xl
      shadow-xl
      font-bold
    "
  >
    ✅ Añadido al carrito
  </div>

)}

      </div>

      {/* CARD */}

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
          (oferta.productos.precio -
            oferta.precio_oferta)
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
            alt="Oferta"
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
              "
            >
              {oferta.productos.nombre}
            </h3>

            <div
              className="
                flex
                items-end
                gap-1
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

          {/* IMAGEN */}

          <img
            src={oferta?.productos?.imagen}
            alt="Oferta"
            className="
              w-[92px]
              h-[92px]
              rounded-[1.4rem]
              object-cover
            "
          />

          {/* INFO */}

          <div className="flex-1">

            <div
              className="
                inline-flex
                items-center
                justify-center
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
              {oferta?.productos?.nombre}
            </h3>

            <div
              className="
                flex
                items-end
                gap-1
                mt-1
              "
            >
              <span 
                className="
                  text-[1.4rem]
                  leading-none
                  font-black
                  text-green-700
                "
              >
                {Number(oferta?.precio_oferta).toFixed(2)}€
              </span>

              <span
                className="
                  text-gray-400
                  line-through
                  text-[0.9rem]
                  mb-[2px]
                "
              >
                {Number(oferta?.productos?.precio).toFixed(2)}€
              </span><div className="flex items-center gap-2">

  <span
    className="
      text-green-700
      text-[1.4rem]
      font-black
    "
  >
    →
  </span>

  <button
    onClick={agregarOferta}
    className="
      w-[42px]
      h-[35px]
      rounded-xl
      bg-orange-500/20
      shadow-md
    "
  >
    🛒
  </button>

</div>

            </div>

            

          </div>

        </div>

      </div>

    </div>

  )

}