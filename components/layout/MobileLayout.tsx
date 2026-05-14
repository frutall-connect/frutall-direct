import Link from 'next/link'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t flex justify-around py-3">

      <Link href="/">
        Inicio
      </Link>

      <Link href="/pedidos">
        Pedidos
      </Link>

      <Link href="/cuenta">
        Cuenta
      </Link>

    </nav>
  )
}