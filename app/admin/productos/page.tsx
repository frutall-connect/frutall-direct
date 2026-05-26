'use client'

import { useEffect, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

import AdminGuard from '@/components/auth/AdminGuard'

export default function AdminProductosPage() {

  const [productos, setProductos] = useState<any[]>([])

  const [categorias, setCategorias] = useState<any[]>([])

  const [catalogoCategorias, setCatalogoCategorias] =
  useState<any[]>([])

const [productosBase, setProductosBase] =
  useState<any[]>([])

const [variedades, setVariedades] =
  useState<any[]>([])

const [categoriaCatalogoId, setCategoriaCatalogoId] =
  useState('')

const [productoBaseId, setProductoBaseId] =
  useState('')

const [variedadId, setVariedadId] =
  useState('')

  const [ubicaciones, setUbicaciones] =
  useState<any[]>([])

const [ubicacionId, setUbicacionId] =
  useState('')

  const [subiendo, setSubiendo] = useState(false)

  const [nuevoProducto, setNuevoProducto] =
    useState({

      nombre: '',

      precio: '',

      stock: '',

      unidad: 'kg',

      categoria_id: '',

      activo: true

    })

  useEffect(() => {

    cargarProductos()

    cargarCategorias()

    cargarUbicaciones()

    cargarCatalogoCategorias()

  }, [])

  async function cargarProductos() {

    const { data, error } = await supabase

      .from('productos')

      .select(`
        *,
        categorias (
          nombre
        )
      `)

      .order('created_at', {
        ascending: false
      })

    if (!error && data) {
      setProductos(data)
    }

  }

  async function cargarCategorias() {

    const { data } = await supabase

      .from('categorias')

      .select('*')

    if (data) {
      setCategorias(data)
    }

  }

async function cargarCatalogoCategorias() {

  const { data } =
    await supabase

      .from('categorias_producto')

      .select('*')

      .order('nombre')

  setCatalogoCategorias(data || [])

}

async function cargarProductosBase(
  categoriaId: string
) {

  const { data } =
    await supabase

      .from('productos_base')

      .select('*')

      .eq(
        'categoria_id',
        categoriaId
      )

      .order('nombre')

  setProductosBase(data || [])

}

async function cargarVariedades(
  productoBaseId: string
) {

  const { data } =
    await supabase

      .from('variedades_producto')

      .select('*')

      .eq(
        'producto_base_id',
        productoBaseId
      )

      .order('nombre')

  setVariedades(data || [])

}



  async function crearProducto() {

    if (
      !nuevoProducto.nombre
      || !nuevoProducto.precio
      || !nuevoProducto.stock
      || !nuevoProducto.categoria_id
    ) {

      alert('Completa todos los campos')

      return

    }

    const { error } = await supabase

      .from('productos')

      .insert([{

        nombre:

  variedades.find(

    (v) => v.id === variedadId

  )?.nombre || '',

        ubicacion_id: ubicacionId || null,

        precio: Number(nuevoProducto.precio),

        stock: Number(nuevoProducto.stock),

        unidad: nuevoProducto.unidad,

        categoria_id: nuevoProducto.categoria_id,

        activo: nuevoProducto.activo

      }])

    if (!error) {

      alert('Producto creado')

      setNuevoProducto({

        nombre: '',

        precio: '',

        stock: '',

        unidad: 'kg',

        categoria_id: '',

        activo: true

      })

      cargarProductos()

    }

  }

async function cargarUbicaciones() {

  const { data } =
    await supabase

      .from('ubicaciones')

      .select('*')

      .order('codigo')

  setUbicaciones(data || [])

}

  async function actualizarProducto(
    id: string,
    campo: string,
    valor: any
  ) {

    const { error } = await supabase

      .from('productos')

      .update({
        [campo]: valor
      })

      .eq('id', id)

    if (!error) {
      cargarProductos()
    }

  }

  async function subirImagen(
    e: any,
    productoId: string
  ) {

    try {

      setSubiendo(true)

      const file = e.target.files[0]

      if (!file) return

      const fileExt =
        file.name.split('.').pop()

      const fileName =
        `${productoId}-${Date.now()}.${fileExt}`

      const filePath =
        `productos/${fileName}`

      const { error: uploadError } =
        await supabase.storage

          .from('producto-imagenes')

          .upload(filePath, file)

      if (uploadError) {

        console.error(uploadError)

        alert('Error subiendo imagen')

        return

      }

      const { data } = supabase.storage

        .from('producto-imagenes')

        .getPublicUrl(filePath)

      await actualizarProducto(
        productoId,
        'imagen_url',
        data.publicUrl
      )

      alert('Imagen subida')

    } catch (error) {

      console.error(error)

    } finally {

      setSubiendo(false)

    }

  }

  return (

  <AdminGuard allow={['admin']}>

    <MobileLayout>

      <div className="min-h-screen bg-[#f5f3eb] pb-32">

        {/* HEADER */}

        <div
          className="
            bg-white
            px-5
            pt-5
            pb-4
            border-b
            sticky
            top-0
            z-40
          "
        >

          <h1
            className="
              text-3xl
              font-black
              text-black
            "
          >
            Admin Productos
          </h1>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Gestión del catálogo
          </p>

        </div>

        {/* NUEVO PRODUCTO */}

        <div className="p-4">

          <div
            className="
              bg-white
              rounded-3xl
              shadow-lg
              p-5
            "
          >

            <h2
              className="
                text-xl
                font-black
                mb-4
              "
            >
              Nuevo Producto
            </h2>

            <div className="space-y-3">

              <select

  value={categoriaCatalogoId}

  onChange={(e) => {

    setCategoriaCatalogoId(
      e.target.value
    )

    cargarProductosBase(
      e.target.value
    )

  }}

  className="
    w-full
    bg-[#f5f3eb]
    rounded-2xl
    px-4
    py-3
  "
>

  <option value="">
    Categoría catálogo
  </option>

  {catalogoCategorias.map((cat) => (

    <option
      key={cat.id}
      value={cat.id}
    >

      {cat.nombre}

    </option>

  ))}

</select>

<select

  value={productoBaseId}

  onChange={(e) => {

    setProductoBaseId(
      e.target.value
    )

    cargarVariedades(
      e.target.value
    )

  }}

  className="
    w-full
    bg-[#f5f3eb]
    rounded-2xl
    px-4
    py-3
  "
>

  <option value="">
    Producto base
  </option>

  {productosBase.map((prod) => (

    <option
      key={prod.id}
      value={prod.id}
    >

      {prod.nombre}

    </option>

  ))}

</select>

<select

  value={variedadId}

  onChange={(e) =>

    setVariedadId(
      e.target.value
    )

  }

  className="
    w-full
    bg-[#f5f3eb]
    rounded-2xl
    px-4
    py-3
  "
>

  <option value="">
    Variedad
  </option>

  {variedades.map((v) => (

    <option
      key={v.id}
      value={v.id}
    >

      {v.nombre}

    </option>

  ))}

</select>

              <input
                type="number"
                placeholder="Precio"
                value={nuevoProducto.precio}
                onChange={(e) =>
                  setNuevoProducto({

                    ...nuevoProducto,

                    precio: e.target.value

                  })
                }
                className="
                  w-full
                  bg-[#f5f3eb]
                  rounded-2xl
                  px-4
                  py-3
                "
              />

              <input
                type="number"
                placeholder="Stock"
                value={nuevoProducto.stock}
                onChange={(e) =>
                  setNuevoProducto({

                    ...nuevoProducto,

                    stock: e.target.value

                  })
                }
                className="
                  w-full
                  bg-[#f5f3eb]
                  rounded-2xl
                  px-4
                  py-3
                "
              />

              <select
                value={nuevoProducto.unidad}
                onChange={(e) =>
                  setNuevoProducto({

                    ...nuevoProducto,

                    unidad: e.target.value

                  })
                }
                className="
                  w-full
                  bg-[#f5f3eb]
                  rounded-2xl
                  px-4
                  py-3
                "
              >

                <option value="kg">
                  kg
                </option>

                <option value="unidad">
                  unidad
                </option>

                <option value="caja">
                  caja
                </option>

              </select>

              <select
                value={nuevoProducto.categoria_id}
                onChange={(e) =>
                  setNuevoProducto({

                    ...nuevoProducto,

                    categoria_id: e.target.value

                  })
                }
                className="
                  w-full
                  bg-[#f5f3eb]
                  rounded-2xl
                  px-4
                  py-3
                "
              >

                <option value="">
                  Categoría
                </option>

                {categorias.map((categoria) => (

                  <option
                    key={categoria.id}
                    value={categoria.id}
                  >
                    {categoria.nombre}
                  </option>

                ))}

              </select>

<select

  value={ubicacionId}

  onChange={(e) =>

    setUbicacionId(
      e.target.value
    )

  }

  className="
    w-full
    p-4
    rounded-2xl
    bg-gray-100
  "
>

  <option value="">
    Seleccionar ubicación
  </option>

  {ubicaciones.map(
    (ubicacion) => (

      <option
        key={ubicacion.id}
        value={ubicacion.id}
      >

        {ubicacion.codigo}
        {' · '}
        {ubicacion.tipo}

      </option>

    )
  )}

</select>

              <button
                onClick={crearProducto}
                className="
                  w-full
                  bg-green-700
                  text-white
                  rounded-2xl
                  py-4
                  font-black
                "
              >
                Crear Producto
              </button>

            </div>

          </div>

        </div>

        {/* PRODUCTOS */}

        <div className="px-4 space-y-4">

          {productos.map((producto) => (

            <div
              key={producto.id}
              className="
                bg-white
                rounded-3xl
                shadow-lg
                p-5
              "
            >

              {/* TOP */}

              <div className="flex gap-4">

                {/* IMAGEN */}

                <div
                  className="
                    w-24
                    h-24
                    rounded-2xl
                    overflow-hidden
                    bg-[#f5f3eb]
                    shrink-0
                  "
                >

                  <img
                    src={
                      producto.imagen_url
                      || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200'
                    }
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />

                </div>

                {/* INFO */}

                <div className="flex-1">

                  <div
                    className="
                      flex
                      justify-between
                      items-start
                    "
                  >

                    <div>

                      <h2
                        className="
                          text-xl
                          font-black
                        "
                      >
                        {producto.nombre}
                      </h2>

                      <p
                        className="
                          text-sm
                          text-gray-500
                          mt-1
                        "
                      >
                        {producto.categorias?.nombre}
                      </p>

                    </div>

                    <div
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        font-bold

                        ${
                          producto.activo

                            ? 'bg-green-100 text-green-700'

                            : 'bg-red-100 text-red-700'
                        }
                      `}
                    >
                      {
                        producto.activo
                          ? 'Activo'
                          : 'Inactivo'
                      }
                    </div>

                  </div>

                  {/* SUBIR */}

                  <label
                    className="
                      inline-block
                      mt-4
                      bg-black
                      text-white
                      px-4
                      py-2
                      rounded-2xl
                      text-sm
                      font-bold
                      cursor-pointer
                    "
                  >

                    {
                      subiendo
                        ? 'Subiendo...'
                        : 'Subir Imagen'
                    }

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        subirImagen(
                          e,
                          producto.id
                        )
                      }
                    />

                  </label>

                </div>

              </div>

              {/* CAMPOS */}

              <div className="grid grid-cols-2 gap-3 mt-5">

                <div>

                  <p
                    className="
                      text-sm
                      text-gray-500
                      mb-1
                    "
                  >
                    Precio
                  </p>

                  <input
                    type="number"
                    value={producto.precio}
                    onChange={(e) =>
                      actualizarProducto(
                        producto.id,
                        'precio',
                        Number(e.target.value)
                      )
                    }
                    className="
                      w-full
                      bg-[#f5f3eb]
                      rounded-2xl
                      px-4
                      py-3
                    "
                  />

                </div>

                <div>

                  <p
                    className="
                      text-sm
                      text-gray-500
                      mb-1
                    "
                  >
                    Stock
                  </p>

                  <input
                    type="number"
                    value={producto.stock}
                    onChange={(e) =>
                      actualizarProducto(
                        producto.id,
                        'stock',
                        Number(e.target.value)
                      )
                    }
                    className="
                      w-full
                      bg-[#f5f3eb]
                      rounded-2xl
                      px-4
                      py-3
                    "
                  />

                </div>

              </div>

              {/* BOTÓN */}

              <button
                onClick={() =>
                  actualizarProducto(
                    producto.id,
                    'activo',
                    !producto.activo
                  )
                }
                className="
                  w-full
                  mt-5
                  bg-black
                  text-white
                  rounded-2xl
                  py-3
                  font-bold
                "
              >
                {
                  producto.activo

                    ? 'Desactivar'

                    : 'Activar'
                }
              </button>

            </div>

          ))}

        </div>

      </div>

      <BottomNav />

    </MobileLayout>

  </AdminGuard>

  )

}