'use client'

import { ReactNode } from 'react'
import BottomNav from './BottomNav'
import Header from './Header'

interface Props {
  children: ReactNode
  title?: string
}

export default function MobileLayout({ children, title }: Props) {
  return (
    <main className="min-h-screen bg-[#f5f3ee] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#f5f3ee] shadow-xl relative pb-24">

        <Header title={title} />

        <div className="p-4">
          {children}
        </div>

        <BottomNav />
      </div>
    </main>
  )
}