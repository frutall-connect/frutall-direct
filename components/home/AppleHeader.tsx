'use client'

import Image from 'next/image'

export default function AppleHeader() {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        px-1
        pt-1
      "
    >

      {/* LOGO */}

      <Image
        src="/logo-frutall-direct.png"
        alt="FrutALL Direct"
        width={150}
        height={50}
        priority
        className="
          h-[40px]
          w-auto
          object-contain
        "
      />

      {/* ICONOS */}

      <div
        className="
          flex
          items-center
          gap-5
          pr-1
        "
      >

        {/* WHATSAPP */}

        <button
          className="
            flex
            items-center
            justify-center
          "
        >

          <div
            className="
              w-11
              h-11
              rounded-full
              border-[2.5px]
              border-green-600
              flex
              items-center
              justify-center
              text-green-600
              text-[1.6rem]
              font-bold
            "
          >
            ◔
          </div>

        </button>

        {/* MENU */}

        <button
          className="
            flex
            flex-col
            justify-center
            gap-[5px]
          "
        >

          <div className="w-8 h-[3px] rounded-full bg-black" />
          <div className="w-8 h-[3px] rounded-full bg-black" />
          <div className="w-8 h-[3px] rounded-full bg-black" />

        </button>

      </div>

    </div>

  )

}