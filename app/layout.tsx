import './globals.css'

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