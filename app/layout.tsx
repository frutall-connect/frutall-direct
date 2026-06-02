import './globals.css'

import AppleHeader from '@/components/home/AppleHeader'

export default function MobileLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
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

      {children}
    </>
  )
}

export const metadata = {

  title: 'FrutALL Direct',

  description: 'Pedidos directos al almacén',

  manifest: '/manifest.json',

  themeColor: '#15803d',

  appleWebApp: {

    capable: true,

    statusBarStyle: 'default',

    title: 'FrutALL',

  },

  icons: {

    apple: '/icon-192.png',

  },

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <html lang="es">

      <body className="bg-white">

        {children}

      </body>

    </html>

  )

}