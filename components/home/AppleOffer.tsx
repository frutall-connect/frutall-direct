'use client'

export default function AppleOffer() {

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

        <span
          className="
            text-green-700
            text-[1.4rem]
            font-light
          "
        >
        </span>
      </div>

      {/* CARD */}

      <div
        className="
          h-[100px]
          bg-white/60
          backdrop-blur-md
          rounded-[1.4rem]
          p-3
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

            src="
https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=1200&auto=format&fit=crop
"

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
              Uva Roja
              <br />
              Sin Semilla
            </h3>

            <div
              className="
                flex
                items-end
                gap-2
                mt-3
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
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}