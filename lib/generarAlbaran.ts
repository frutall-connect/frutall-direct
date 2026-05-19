import jsPDF from 'jspdf'

import autoTable from 'jspdf-autotable'

import QRCode from 'qrcode'

export async function generarAlbaran(
  pedido: any
) {

  const doc = new jsPDF()

  // ===== LOGO / HEADER =====

  doc.setFillColor(22, 163, 74)

  doc.rect(0, 0, 210, 35, 'F')

  doc.setTextColor(255, 255, 255)

  doc.setFontSize(28)

  doc.text(
    'FRUTALL',
    20,
    22
  )

  doc.setFontSize(12)

  doc.text(
    'Distribución alimentaria',
    20,
    30
  )

  // ===== TITULO =====

  doc.setTextColor(0, 0, 0)

  doc.setFontSize(20)

  doc.text(
    'ALBARÁN / FACTURA',
    20,
    55
  )

  // ===== INFO =====

  doc.setFontSize(11)

  doc.text(
    `Pedido ID: ${pedido.id}`,
    20,
    70
  )

  doc.text(
    `Fecha: ${new Date(
      pedido.created_at
    ).toLocaleString()}`,
    20,
    78
  )

  doc.text(
    `Estado: ${pedido.estado}`,
    20,
    86
  )

  // ===== CLIENTE =====

  doc.setFontSize(14)

  doc.text(
    'CLIENTE',
    20,
    105
  )

  doc.setFontSize(11)

  doc.text(
    pedido.cliente?.empresa
    || 'Cliente FrutALL',
    20,
    115
  )

  doc.text(
    pedido.cliente?.direccion
    || '',
    20,
    123
  )

  doc.text(
    pedido.cliente?.telefono
    || '',
    20,
    131
  )

  // ===== TABLA =====

  autoTable(doc, {

    startY: 145,

    head: [[
      'Producto',
      'Cantidad',
      'Subtotal'
    ]],

    body:

      pedido.lineas_pedido?.map(
        (linea: any) => ([

          linea.nombre_producto,

          linea.cantidad,

          `${linea.subtotal?.toFixed(2)} €`

        ])
      ) || [],

    styles: {

      fontSize: 11,

      cellPadding: 4

    },

    headStyles: {

      fillColor: [22, 163, 74]

    }

  })

  // ===== TOTAL =====

  const finalY =
    (doc as any).lastAutoTable.finalY + 15

  doc.setFontSize(18)

  doc.text(
    `TOTAL: ${pedido.total?.toFixed(2)} €`,
    20,
    finalY
  )

  // ===== QR =====

  const qrData = await QRCode.toDataURL(

    `Pedido ${pedido.id}
    Total ${pedido.total} €`

  )

  doc.addImage(
    qrData,
    'PNG',
    150,
    finalY - 10,
    40,
    40
  )

  // ===== FOOTER =====

  doc.setFontSize(10)

  doc.text(
    'Gracias por confiar en FrutALL',
    20,
    280
  )

  doc.save(
    `factura-${pedido.id}.pdf`
  )

}