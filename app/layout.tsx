import './globals.css'
import BottomNav from '../components/BottomNav'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-100 flex justify-center">
        <div className="w-full max-w-md min-h-screen bg-white relative pb-20 shadow-xl">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  )
}