'use client'

import { useEffect, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import { supabase } from '@/lib/supabaseClient'

export default function AdminProductosPage() {

  const [productos, setProductos] = useState<any[]>([])

  const [categorias, setCategorias] = useState<any[]>([])

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

        nombre: nuevoProducto.nombre,

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

              <input
                type="text"
                placeholder="Nombre"
                value={nuevoProducto.nombre}
                onChange={(e) =>
                  setNuevoProducto({

                    ...nuevoProducto,

                    nombre: e.target.value

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

  )

}