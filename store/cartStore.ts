'use client'

import { create } from 'zustand'

import { persist } from 'zustand/middleware'

interface CartItem {

  id: string

  nombre: string

  precio: number

  cantidad: number

  envase?: string

  variedad?: string

}

interface CartStore {

  items: CartItem[]

  setItems: (items: CartItem[]) => void

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

          // MISMO PRODUCTO + MISMA VARIEDAD + MISMO ENVASE

          const existente = state.items.find(

            (item) =>

              item.id === producto.id

              && item.envase === producto.envase

              && item.variedad === producto.variedad

          )

          // SI YA EXISTE → SUMAR CANTIDAD

          if (existente) {

            return {

              items: state.items.map((item) =>

                item.id === producto.id
                && item.envase === producto.envase
                && item.variedad === producto.variedad

                  ? {

                      ...item,

                      cantidad:
                        item.cantidad + producto.cantidad

                    }

                  : item

              )

            }

          }

          // SI NO EXISTE → NUEVA LÍNEA

          return {

            items: [

              ...state.items,

              {

                id: producto.id,

                nombre: producto.nombre,

                precio: producto.precio,

                cantidad: producto.cantidad,

                envase: producto.envase,

                variedad: producto.variedad

              }

            ]

          }

        }),

      removeItem: (id) =>

        set((state) => ({

          items: state.items.filter(
            (item) => item.id !== id
          )

        })),

      clearCart: () =>

        set({
          items: []
        }),

setItems: (items) =>

  set({
    items
  })

    }),

    {
      name: 'frutall-cart'
    }

  )

)