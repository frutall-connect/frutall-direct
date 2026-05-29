'use client'

import { useEffect, useState } from 'react'

import MobileLayout from '@/components/layout/MobileLayout'
import BottomNav from '@/components/layout/BottomNav'

import AppleHeader from '@/components/home/AppleHeader'
import AppleHero from '@/components/home/AppleHero'
import AppleCategories from '@/components/home/AppleCategories'
import AppleOffer from '@/components/home/AppleOffer'
import AppleActions from '@/components/home/AppleActions'

import { supabase } from '@/lib/supabaseClient'

import { useCartStore } from '@/store/cartStore'

export default function InicioPage() {

const [categorias, setCategorias] =
useState<any[]>([])

const [usuario, setUsuario] =
useState('Cliente')

const items = useCartStore(
(state) => state.items
)

const setItems = useCartStore(
(state) => state.setItems
)

useEffect(() => {

```
cargarCategorias()
cargarUsuario()
```

}, [])

async function cargarUsuario() {

```
const { data } =
  await supabase.auth.getUser()

const email =
  data.user?.email || ''

const nombre =
  email.split('@')[0]

if (nombre) {
  setUsuario(nombre)
}
```

}

async function cargarCategorias() {

```
const { data, error } =
  await supabase
    .from('categorias')
    .select('*')

if (!error && data) {
  setCategorias(data)
}
```

}

async function repetirUltimoPedido() {

const { data: authData } =
  await supabase.auth.getUser()

const usuario =
  authData.user

if (!usuario) return

const { data: pedido } =
  await supabase
    .from('pedidos')
    .select('*, lineas_pedido (*)')

    .eq(
      'usuario_id',
      usuario.id
    )

    .order(
      'created_at',
      {
        ascending: false
      }
    )

    .limit(1)

    .single()

if (!pedido) {

  alert(
    'No tienes pedidos anteriores'
  )

  return

}

const nuevosItems =
  pedido.lineas_pedido.map(
    (linea: any) => ({

      id: linea.producto_id,

      nombre:
        linea.nombre_producto,

      precio:
        linea.precio,

      cantidad:
        linea.cantidad,

      envase:
        linea.envase ||
        'Caja',

      variedad:
        linea.variedad ||
        'Normal'

    })
  )

setItems(nuevosItems)

alert(
  'Pedido cargado en carrito'
)

window.location.href =
  '/carrito'
```

}

const totalProductos =
items.reduce(

```
  (acc, item) =>
    acc + item.cantidad,

  0

)
```

return (

```
<MobileLayout>

  {/* HEADER BLANCO */}

  <div
    className="
      bg-white
      w-full
      px-4
      pt-3
      pb-2
    "
  >
    <AppleHeader />
  </div>

  {/* CONTENIDO */}

  <div
  className="
    min-h-screen
    pb-32
    bg-cover
    bg-top
    bg-no-repeat
    bg-fixed
  "
  style={{
    backgroundImage:
      "url('/hero-bg-premium.png')"
  }}
>

    <div className="px-4 pt-3">

      <AppleHero
        usuario={usuario}
      />

      <AppleCategories />

      <AppleOffer />

      <AppleActions

        totalProductos={
          totalProductos
        }

        repetirUltimoPedido={
          repetirUltimoPedido
        }

      />

    </div>

  </div>

  <BottomNav />

</MobileLayout>
```

)

}
