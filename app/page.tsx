export default function HomePage() {
  return (
    <main className="p-4">
      <h1 className="text-4xl font-bold text-green-700 mb-2">
        FrutALL
      </h1>

      <p className="text-gray-600 mb-6">
        Bienvenido 👋
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-500 rounded-2xl h-32 text-white p-4 font-bold">
          Frutas & Verduras
        </div>

        <div className="bg-yellow-500 rounded-2xl h-32 text-white p-4 font-bold">
          Productos Secos
        </div>

        <div className="bg-blue-500 rounded-2xl h-32 text-white p-4 font-bold">
          Lácteos
        </div>

        <div className="bg-red-500 rounded-2xl h-32 text-white p-4 font-bold">
          Carnes
        </div>
      </div>
    </main>
  )
}