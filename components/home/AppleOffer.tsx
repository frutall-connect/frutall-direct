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

  const [oferta, setOferta] =
    useState<any>(null)

async function cargarOferta() {

  const { data, error } =
    await supabase
      .from('ofertas_home')
      .select('*')
      .eq('activa', true)
      .limit(1)
      .single()

  console.log('DATA:', data)
  console.log('ERROR:', error)

  if (!error && data) {
    setOferta(data)
  }

}

useEffect(() => {

  cargarOferta()

}, [])

  function agregarOferta() {

  addItem({

    id: 'oferta-uva-roja',

    nombre: 'Uva Roja Sin Semilla',

    precio: 1.8,

    cantidad: 1,

    envase: 'Caja',

    variedad: 'Normal'

  })

  setMostrarToast(true)

  setTimeout(() => {

    setMostrarToast(false)

  }, 2000)

}

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

<p className="text-xs text-red-500">
  {oferta ? JSON.stringify(oferta) : 'SIN OFERTA'}
</p>

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
          bg-white/60
          backdrop-blur-md
          rounded-[1.4rem]
          p-2
          shadow-sm
          border
          border-white/40
        "
      >

        <div
          className="
            flex
            gap-4
            items-center
          "
        >

          {/* IMAGEN */}

          <img
            src="https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=1200&auto=format&fit=crop"
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
              -20%
            </div>

            <h3
              className="
                text-[1.05rem]
                leading-[1.2rem]
                font-black
                mt-3
                text-black
              "
            >
              Uva Roja Sin Semilla
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
                1,80€
              </span>

              <span
                className="
                  text-gray-400
                  line-through
                  text-[0.9rem]
                  mb-[2px]
                "
              >
                2,30€
              </span><button
              onClick={agregarOferta}
              className="
                mt-3
                w-[42px]
                h-[35px]
                rounded-xl
                bg-orange/20
                backdrop-blur-md
                text-white
                font-black
                text-[0.9rem]
                shadow-md
                active:scale-[0.98]
                transition
              " 
            >
              🛒
            </button>

            </div>

            

          </div>

        </div>

      </div>

    </div>

  )

}