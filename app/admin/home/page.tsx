'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AdminGuard from '@/components/auth/AdminGuard'

const emptyCampaign = {
  nombre: '',
  imagen_fondo: '',
  activa: false,
  fecha_inicio: '',
  fecha_fin: ''
}

export default function AdminHomePage() {
  const [hero, setHero] = useState<any>(null)
  const [campanas, setCampanas] = useState<any[]>([])
  const [crear, setCrear] = useState<any>(emptyCampaign)
  const [editar, setEditar] = useState<any>(null)
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    cargarHero()
    cargarCampanas()
  }, [])

  async function cargarHero() {
    const { data } = await supabase
      .from('hero_home')
      .select('*')
      .eq('activa', true)
      .single()

    setHero(data)
  }

  async function cargarCampanas() {
    const { data } = await supabase
      .from('campanas_home')
      .select('*')
      .order('created_at', { ascending: false })

    setCampanas(data || [])
  }

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

  async function subirImagen(file: File, modo: 'crear' | 'editar') {
    setSubiendo(true)

    const nombre = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('campanas')
      .upload(nombre, file)

    if (error) {
      alert(error.message)
      setSubiendo(false)
      return
    }

    const { data } = supabase.storage
      .from('campanas')
      .getPublicUrl(nombre)

    if (modo === 'crear') {
      setCrear((p:any) => ({ ...p, imagen_fondo: data.publicUrl }))
    } else {
      setEditar((p:any) => ({ ...p, imagen_fondo: data.publicUrl }))
    }

    setSubiendo(false)
  }

  async function crearCampana() {
    await supabase.from('campanas_home').insert({
      nombre: crear.nombre,
      imagen_fondo: crear.imagen_fondo,
      fecha_inicio: crear.fecha_inicio || null,
      fecha_fin: crear.fecha_fin || null,
      activa: false
    })

    setCrear(emptyCampaign)
    cargarCampanas()
  }

  async function guardarEdicion() {
    if (!editar?.id) return

    await supabase
      .from('campanas_home')
      .update({
        nombre: editar.nombre,
        imagen_fondo: editar.imagen_fondo,
        fecha_inicio: editar.fecha_inicio || null,
        fecha_fin: editar.fecha_fin || null
      })
      .eq('id', editar.id)

    cargarCampanas()
    alert('Campaña actualizada')
  }

  async function activar(id:string) {
    await supabase.from('campanas_home').update({ activa:false }).neq('id','')
    await supabase.from('campanas_home').update({ activa:true }).eq('id',id)
    cargarCampanas()
  }

  async function desactivar(id:string) {
    await supabase.from('campanas_home').update({ activa:false }).eq('id',id)
    cargarCampanas()
  }

  async function eliminar(id:string) {
    if (!confirm('¿Eliminar campaña?')) return
    await supabase.from('campanas_home').delete().eq('id',id)
    if (editar?.id === id) setEditar(null)
    cargarCampanas()
  }

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        <div className="bg-white p-6 rounded-3xl shadow">
          <h2 className="font-black text-2xl mb-4">Hero</h2>

          <input className="w-full border p-3 rounded-xl mb-3"
            value={hero?.titulo || ''}
            onChange={(e)=>setHero({...hero,titulo:e.target.value})}
            placeholder="Título"
          />

          <input className="w-full border p-3 rounded-xl mb-3"
            value={hero?.subtitulo || ''}
            onChange={(e)=>setHero({...hero,subtitulo:e.target.value})}
            placeholder="Subtítulo"
          />

          <input className="w-full border p-3 rounded-xl mb-4"
            value={hero?.imagen || ''}
            onChange={(e)=>setHero({...hero,imagen:e.target.value})}
            placeholder="Imagen"
          />

          <button onClick={guardarHero} className="bg-green-700 text-white px-5 py-3 rounded-xl">
            Guardar Hero
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <h2 className="font-black text-2xl mb-4">Crear campaña</h2>

          <input className="w-full border p-3 rounded-xl mb-3" placeholder="Nombre"
            value={crear.nombre}
            onChange={(e)=>setCrear({...crear,nombre:e.target.value})}
          />

          <input type="datetime-local" className="w-full border p-3 rounded-xl mb-3"
            value={crear.fecha_inicio}
            onChange={(e)=>setCrear({...crear,fecha_inicio:e.target.value})}
          />

          <input type="datetime-local" className="w-full border p-3 rounded-xl mb-3"
            value={crear.fecha_fin}
            onChange={(e)=>setCrear({...crear,fecha_fin:e.target.value})}
          />

          <input type="file" accept="image/*"
            onChange={(e)=>e.target.files?.[0] && subirImagen(e.target.files[0],'crear')}
          />

          {crear.imagen_fondo && <img src={crear.imagen_fondo} className="w-full h-56 object-cover rounded-xl mt-4" />}

          <button onClick={crearCampana} className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-xl">
            Crear campaña
          </button>
        </div>

        {editar && (
          <div className="bg-white p-6 rounded-3xl shadow">
            <h2 className="font-black text-2xl mb-4">Editar campaña</h2>

            <input className="w-full border p-3 rounded-xl mb-3"
              value={editar.nombre}
              onChange={(e)=>setEditar({...editar,nombre:e.target.value})}
            />

            <input type="file" accept="image/*"
              onChange={(e)=>e.target.files?.[0] && subirImagen(e.target.files[0],'editar')}
            />

            <button onClick={guardarEdicion} className="mt-4 bg-green-700 text-white px-5 py-3 rounded-xl">
              Guardar cambios
            </button>
          </div>
        )}

        <div className="space-y-4">
          {campanas.map((c)=>(
            <div key={c.id} className="bg-white p-4 rounded-2xl shadow">
              <img src={c.imagen_fondo} className="w-full h-48 object-cover rounded-xl" />
              <div className="mt-3 font-bold">{c.nombre}</div>
              <div>{c.activa ? '🟢 Activa' : '⚪ Inactiva'}</div>

              <div className="flex gap-2 mt-3 flex-wrap">
                <button onClick={()=>setEditar(c)} className="bg-blue-600 text-white px-4 py-2 rounded-xl">Editar</button>
                <button onClick={()=>activar(c.id)} className="bg-green-600 text-white px-4 py-2 rounded-xl">Activar</button>
                <button onClick={()=>desactivar(c.id)} className="bg-yellow-500 text-white px-4 py-2 rounded-xl">Desactivar</button>
                <button onClick={()=>eliminar(c.id)} className="bg-red-600 text-white px-4 py-2 rounded-xl">Eliminar</button>
              </div>
            </div>
          ))}
        </div>

        {subiendo && <p>Subiendo imagen...</p>}
      </div>
    </AdminGuard>
  )
}
