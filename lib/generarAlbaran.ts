import { supabase } from '@/lib/supabaseClient'

export async function generarAlbaran(pedido: { id: string }) {
  const ventana = window.open('', '_blank')

  if (!ventana) {
    alert('No se pudo abrir el albarán. Comprueba los bloqueadores de ventanas.')
    return
  }

  try {
    const { data, error } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token

    if (error || !accessToken) {
      throw new Error('Debes iniciar sesión de nuevo')
    }

    const response = await fetch(`/api/albaran/${encodeURIComponent(pedido.id)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store'
    })

    if (!response.ok) {
      const body: unknown = await response.json()
      const message =
        typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
          ? body.error
          : 'No se pudo generar el albarán'
      throw new Error(message)
    }

    if (!response.headers.get('content-type')?.startsWith('application/pdf')) {
      throw new Error('La respuesta del albarán no es un PDF')
    }

    const url = URL.createObjectURL(await response.blob())
    ventana.location.replace(url)
  } catch (error) {
    ventana.close()
    console.error('Error al abrir el albarán:', error)
    alert(error instanceof Error ? error.message : 'No se pudo generar el albarán')
  }
}
