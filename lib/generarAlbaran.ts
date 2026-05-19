import jsPDF from 'jspdf'

export async function generarAlbaran(
  pedido: any
) {

  const doc = new jsPDF()

  // HEADER

  doc.setFontSize(24)

  doc.text(
    'FRUTALL',
    20,
    20
  )

  doc.setFontSize(12)

  doc.text(
    'Albarán de pedido',
    20,
    30
  )

  // INFO

  doc.setFontSize(11)

  doc.text(
    `Pedido ID: ${pedido.id}`,
    20,
    50
  )

  doc.text(
    `Fecha: ${new Date(
      pedido.created_at
    ).toLocaleString()}`,
    20,
    58
  )

  doc.text(
    `Estado: ${pedido.estado}`,
    20,
    66
  )

  // PRODUCTOS

  let y = 90

  doc.setFontSize(14)

  doc.text(
    'Productos',
    20,
    y
  )

  y += 10

  pedido.lineas_pedido?.forEach(
    (linea: any) => {

      doc.setFontSize(11)

      doc.text(

        `${linea.nombre_producto}
        x${linea.cantidad}`,

        20,

        y
      )

      doc.text(

        `${linea.subtotal?.toFixed(2)} €`,

        170,

        y,

        {
          align: 'right'
        }
      )

      y += 10

    }
  )

  // TOTAL

  y += 10

  doc.setFontSize(16)

  doc.text(
    `TOTAL: ${pedido.total?.toFixed(2)} €`,
    20,
    y
  )

  // FOOTER

  y += 30

  doc.setFontSize(10)

  doc.text(
    'Gracias por confiar en FrutALL',
    20,
    y
  )

  doc.save(
    `albaran-${pedido.id}.pdf`
  )

}