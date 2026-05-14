interface Props {
  children: React.ReactNode
  title?: string
}

export default function MobileLayout({
  children,
  title,
}: Props) {
  return (
    <main className="min-h-screen bg-[#f5f3eb] max-w-md mx-auto">

      {title && (
        <div className="p-4 pb-0">
          <h1 className="text-3xl font-bold text-green-700">
            {title}
          </h1>
        </div>
      )}

      {children}

    </main>
  )
}