export default function AdminPage() {

  const links = [

    {
      titulo: 'Gestión Home',
      href: '/admin/home',
      emoji: '🏠'
    },

    {
      titulo: 'Ofertas',
      href: '/admin/ofertas',
      emoji: '🔥'
    },

    {
      titulo: 'Importar tarifa',
      href: '/admin/importar-tarifa',
      emoji: '📥'
    },

    {
      titulo: 'Variedades',
      href: '/admin/variedades',
      emoji: '🌱'
    },

    {
      titulo: 'Productos',
      href: '/admin/productos',
      emoji: '🍅'
    },

    {
      titulo: 'Pedidos',
      href: '/admin/pedidos',
      emoji: '🛒'
    },

    {
      titulo: 'Tarifas',
      href: '/admin/tarifas',
      emoji: '💰'
    }

  ]

  return (

    <main
      className="
        min-h-screen
        bg-white
        p-6
      "
    >

      <h1
        className="
          text-4xl
          font-black
          mb-8
        "
      >

        Dashboard Admin

      </h1>

      <div
        className="
          grid
          gap-5
        "
      >

        {links.map((link) => (

          <a

            key={link.href}

            href={link.href}

            className="
              bg-white
              rounded-3xl
              p-6
              shadow-lg
              flex
              items-center
              justify-between
              text-2xl
              font-bold
            "

          >

            <span>

              {link.emoji}
              {' '}
              {link.titulo}

            </span>

            <span>

              →

            </span>

          </a>

        ))}

      </div>

    </main>

  )

}