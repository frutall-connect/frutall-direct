export async function generarAlbaran(
  pedido: any
) {

  window.open(

    `/api/albaran/${pedido.id}`,

    '_blank'

  )

}