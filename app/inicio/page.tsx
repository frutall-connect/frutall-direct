import MobileLayout from '@/components/layout/MobileLayout'

export default function InicioPage() {
  return (
    <MobileLayout title="Bienvenido">

      <div className="space-y-6">

        <div>
          <h2 className="text-3xl font-bold text-green-800">
            ¿Qué necesitas hoy?
          </h2>

          <p className="text-gray-600 mt-2">
            Productos frescos directos del almacén.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="bg-green-500 rounded-2xl p-6 text-white font-bold text-xl shadow-lg">
            🍎
            <div className="mt-4">
              Frutas
            </div>
          </div>

          <div className="bg-orange-400 rounded-2xl p-6 text-white font-bold text-xl shadow-lg">
            🥬
            <div className="mt-4">
              Verduras
            </div>
          </div>

          <div className="bg-yellow-500 rounded-2xl p-6 text-white font-bold text-xl shadow-lg">
            🥔
            <div className="mt-4">
              Tubérculos
            </div>
          </div>

          <div className="bg-red-500 rounded-2xl p-6 text-white font-bold text-xl shadow-lg">
            🍅
            <div className="mt-4">
              Temporada
            </div>
          </div>

        </div>

      </div>

    </MobileLayout>
  )
}