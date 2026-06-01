'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AdminGuard from '@/components/auth/AdminGuard'

export default function AdminHomePage() {

const [subiendo, setSubiendo] =
  useState(false)

  const [hero, setHero] = useState<any>(null)
  const [campana, setCampana] = useState<any>(null)

const [campanas, setCampanas] =
  useState<any[]>([])

async function subirImagen(
  archivo: File
) {

  setSubiendo(true)

  const nombre =
    `${Date.now()}-${archivo.name}`

  const { error } =
    await supabase.storage
      .from('campanas')
      .upload(nombre, archivo)

  if (error) {

    alert(error.message)

    setSubiendo(false)

    return

  }

  const { data } =
    supabase.storage
      .from('campanas')
      .getPublicUrl(nombre)

  setCampana({
    ...campana,
    imagen_fondo:
      data.publicUrl
  })

  setSubiendo(false)

}

  async function cargarDatos() {

  const { data: heroData } =
    await supabase
      .from('hero_home')
      .select('*')
      .eq('activa', true)
      .single()

  const { data: campanaData, error } =
    await supabase
      .from('campanas_home')
      .select('*')
      .eq('activa', true)
      .maybeSingle()

  console.log('CAMPANA ACTIVA', campanaData)
  console.log('ERROR CAMPANA', error)

  setHero(heroData)

  if (campanaData) {
    setCampana(campanaData)
  }

}

  useEffect(() => {

  cargarDatos()
  cargarCampanas()

}, [])

async function activarCampana(id: string) {

  await supabase
    .from('campanas_home')
    .update({
      activa: false
    })
    .neq('id', '')

  await supabase
    .from('campanas_home')
    .update({
      activa: true
    })
    .eq('id', id)

  await cargarDatos()
  await cargarCampanas()

}

async function desactivarCampana(id: string) {

  await supabase
    .from('campanas_home')
    .update({
      activa: false
    })
    .eq('id', id)

  await cargarCampanas()

}

async function eliminarCampana(id: string) {

  if (
    !confirm(
      '¿Eliminar campaña?'
    )
  ) return

  await supabase
    .from('campanas_home')
    .delete()
    .eq('id', id)

  await cargarCampanas()

}

  async function guardarHero() {

  if (!hero) return

  const { data, error } =
    await supabase
      .from('hero_home')
      .update({
        titulo: hero.titulo,
        subtitulo: hero.subtitulo,
        imagen: hero.imagen
      })
      .eq('id', hero.id)
      .select()

  console.log('UPDATE HERO', data)
  console.log('ERROR HERO', error)

  if (error) {
    alert(error.message)
    return
  }

  alert('Hero actualizado')

}

  async function guardarCampana() {

  console.log('CAMPANA COMPLETA', campana)

  if (!campana?.id) {

    alert(
      'La campaña no tiene ID'
    )

    return

  }

  const { data, error } =
    await supabase
      .from('campanas_home')
      .update({
        nombre: campana.nombre,
        imagen_fondo: campana.imagen_fondo
      })
      .eq('id', campana.id)
      .select()

  console.log(data)
  console.log(error)

  if (error) {

    alert(error.message)

    return

  }

  alert('Campaña actualizada')

}

async function cargarCampanas() {

  const { data } =
    await supabase
      .from('campanas_home')
      .select('*')
      .order('created_at', {
        ascending: false
      })

  if (data) {
    setCampanas(data)
  }

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

<div className="mt-10">

  <h2
    className="
      text-2xl
      font-black
      mb-4
    "
  >
    Todas las campañas
  </h2>

  <div className="space-y-4">

    {campanas.map((c) => (

      <div
        key={c.id}
        className="
          bg-white
          rounded-2xl
          p-4
          shadow
        "
      >

        <img
          src={c.imagen_fondo}
          className="
            w-full
            h-40
            object-cover
            rounded-xl
          "
        />

        <div className="mt-3">

          <h3
            className="
              font-black
              text-lg
            "
          >
            {c.nombre}
          </h3>

          <p>
            {c.activa
              ? '🟢 Activa'
              : '⚪ Inactiva'}
          </p>

        </div>

        <div
          className="
            flex
            gap-2
            mt-3
          "
        >

          <button
            onClick={() =>
              activarCampana(c.id)
            }
            className="
              px-4
              py-2
              rounded-xl
              bg-green-600
              text-white
            "
          >
            Activar
          </button>

          <button
            onClick={() =>
              desactivarCampana(c.id)
            }
            className="
              px-4
              py-2
              rounded-xl
              bg-yellow-500
              text-white
            "
          >
            Desactivar
          </button>

          <button
            onClick={() =>
              eliminarCampana(c.id)
            }
            className="
              px-4
              py-2
              rounded-xl
              bg-red-600
              text-white
            "
          >
            Eliminar
          </button>

        </div>

      </div>

    ))}

  </div>

</div>

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

<input
  type="file"
  accept="image/*"
  onChange={(e) => {

    const archivo =
      e.target.files?.[0]

    if (archivo) {

      subirImagen(archivo)

    }

  }}
  className="
    w-full
    border
    p-3
    rounded-xl
    mb-4
  "
/>

{subiendo && (

  <p
    className="
      text-green-700
      font-bold
      mb-4
    "
  >
    Subiendo imagen...
  </p>

)}

{campana?.imagen_fondo && (

  <img
    src={campana.imagen_fondo}
    alt="Vista previa"
    className="
      w-full
      h-[220px]
      object-cover
      rounded-2xl
      mb-4
    "
  />

)}          

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