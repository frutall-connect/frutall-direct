'use client'

import { create } from 'zustand'

import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  nombre: string
  precio: number
  cantidad: number
}

interface CartStore {

  items: CartItem[]

  addItem: (producto: any) => void

  removeItem: (id: string) => void

  clearCart: () => void 

}

export const useCartStore = create<CartStore>()(

  persist(

    (set) => ({

      items: [],

      addItem: (producto) =>

        set((state) => {

          const existente = state.items.find(
            (item) => item.id === producto.id
          )

          if (existente) {

            return {

              items: state.items.map((item) =>

                item.id === producto.id

                  ? {
                      ...item,
                      cantidad: item.cantidad + 1
                    }

                  : item
              )
            }

          }

          return {

            items: [

              ...state.items,

              {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1
              }
            ]
          }

        }),

      removeItem: (id) =>

        set((state) => ({

          items: state.items.filter(
            (item) => item.id !== id
          )

        }))

clearCart: () =>

  set({
    items: []
  })

    }),

    {
      name: 'frutall-cart'
    }

  )

)