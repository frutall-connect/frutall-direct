interface Props {
  title?: string
}

export default function Header({ title }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-green-700 text-white px-4 py-4 shadow-md">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            FrutALL
          </h1>

          {title && (
            <p className="text-sm opacity-90">
              {title}
            </p>
          )}
        </div>

        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
          🛒
        </div>

      </div>

    </header>
  )
}