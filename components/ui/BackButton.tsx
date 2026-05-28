'use client'

import { useRouter }
  from 'next/navigation'

export default function BackButton() {

  const router = useRouter()

  return (

    <button

      onClick={() => router.back()}

      className="
        fixed
        top-4
        left-4
        z-[999]
        w-12
        h-12
        rounded-full
        bg-white/90
        backdrop-blur
        shadow-lg
        border
        border-gray-200
        flex
        items-center
        justify-center
        active:scale-95
        transition
      "
    >

      <span
        className="
          text-2xl
          font-black
          text-gray-800
          leading-none
          -ml-[2px]
        "
      >
        ←
      </span>

    </button>

  )

}