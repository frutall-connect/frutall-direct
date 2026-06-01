'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AdminGuard from '@/components/auth/AdminGuard'

export default function AdminHomePage() {

  const [hero, setHero] = useState<any>(null)
  const [campana, setCampana] = useState<any>(null)

  async function cargarDatos() {

    const { data: heroData } =
      await supabase
        .from('hero_home')
        .select('*')
        .eq('activa', true)
        .single()

    const { data: campanaData } =
      await supabase
        .from('campanas_home')
        .select('*')
        .eq('activa', true)
        .single()

    setHero(heroData)
    setCampana(campanaData)

  }

  useEffect(() => {

    cargarDatos()

  }, [])

  async function guardarHero() {

    if (!hero) return

    await supabase
      .from('hero_home')
      .update({
        titulo: hero.titulo,
        subtitulo: hero.subtitulo,
        imagen: hero.imagen
      })
      .eq('id', hero.id)

    alert('Hero actualizado')

  }

  async function guardarCampana() {

    if (!campana) return

    await supabase
      .from('campanas_home')
      .update({
        nombre: campana.nombre,
        imagen_fondo: campana.imagen_fondo
      })
      .eq('id', campana.id)

    alert('Campaña actualizada')

  }

  return (

    <AdminGuard>

      <div className="max-w-5xl mx-auto p-6">

        <h1
          className="
            text-3xl
            font-black
            mb-8
          "
        >
          Gestión Home
        </h1>

        {/* HERO */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow
            p-6
            mb-8
          "
        >

          <h2
            className="
              text-xl
              font-black
              mb-4
            "
          >
            Hero
          </h2>

          <input
            value={hero?.titulo || ''}
            onChange={(e) =>
              setHero({
                ...hero,
                titulo: e.target.value
              })
            }
            placeholder="Título"
            className="
              w-full
              border
              p-3
              rounded-xl
              mb-3
            "
          />

          <input
            value={hero?.subtitulo || ''}
            onChange={(e) =>
              setHero({
                ...hero,
                subtitulo: e.target.value
              })
            }
            placeholder="Subtítulo"
            className="
              w-full
              border
              p-3
              rounded-xl
              mb-3
            "
          />

          <input
            value={hero?.imagen || ''}
            onChange={(e) =>
              setHero({
                ...hero,
                imagen: e.target.value
              })
            }
            placeholder="URL imagen"
            className="
              w-full
              border
              p-3
              rounded-xl
              mb-4
            "
          />

          <button
            onClick={guardarHero}
            className="
              bg-green-700
              text-white
              px-5
              py-3
              rounded-xl
              font-bold
            "
          >
            Guardar Hero
          </button>

        </div>

        {/* CAMPAÑA */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow
            p-6
          "
        >

          <h2
            className="
              text-xl
              font-black
              mb-4
            "
          >
            Campaña activa
          </h2>

          <input
            value={campana?.nombre || ''}
            onChange={(e) =>
              setCampana({
                ...campana,
                nombre: e.target.value
              })
            }
            placeholder="Nombre"
            className="
              w-full
              border
              p-3
              rounded-xl
              mb-3
            "
          />

          <input
            value={campana?.imagen_fondo || ''}
            onChange={(e) =>
              setCampana({
                ...campana,
                imagen_fondo: e.target.value
              })
            }
            placeholder="URL fondo"
            className="
              w-full
              border
              p-3
              rounded-xl
              mb-4
            "
          />

          <button
            onClick={guardarCampana}
            className="
              bg-green-700
              text-white
              px-5
              py-3
              rounded-xl
              font-bold
            "
          >
            Guardar Campaña
          </button>

        </div>

      </div>

    </AdminGuard>

  )

}