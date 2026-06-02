'use client'

import Image from 'next/image'

import { useRouter } from 'next/navigation'

import { FaWhatsapp, FaArrowLeft } from 'react-icons/fa'

const router = useRouter()

function volver() {

  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }

}

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

<a
  href="https://wa.me/34619627250"
  target="_blank"
  rel="noopener noreferrer"
  className="
    w-10
    h-10
    rounded-full
    bg-white
    flex
    items-center
    justify-center
  "
>
  <FaWhatsapp
    size={24}
    className="text-[#25D366]"
  />
</a>

<button
  onClick={volver}
  aria-label="Volver"
  className="
    w-10
    h-10
    flex
    items-center
    justify-center
  "
>
  <FaArrowLeft
    size={20}
    className="text-black"
  />
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