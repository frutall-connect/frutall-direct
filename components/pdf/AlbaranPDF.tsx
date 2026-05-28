import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from '@react-pdf/renderer'

const styles = StyleSheet.create({

  page: {
    padding: 32,
    backgroundColor: '#f8f8f6',
    fontSize: 11,
    color: '#1f2937'
  },

  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 40,
  paddingBottom: 25,
  borderBottom: '1 solid #d1d5db'
},

  logoBlock: {
    width: '45%'
  },

  logo: {
    width: 180,
    marginBottom: 12
  },

  company: {
    fontSize: 11,
    lineHeight: 1.6
  },

 titleBlock: {
  width: '42%',
  alignItems: 'stretch',
  justifyContent: 'flex-start'
},

  title: {
  fontSize: 42,
  fontWeight: 'heavy',
  color: '#065f46',
  marginBottom: 16,
  textAlign: 'left'
},

  albaranBox: {
  backgroundColor: '#065f46',
  color: 'white',
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 10
},

  sectionRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20
  },

  card: {
  flex: 1,
  backgroundColor: '#ffffff',
  borderRadius: 16,
  padding: 22,
  border: '1 solid #d1d5db'
},

  cardTitle: {
  fontSize: 11,
  fontWeight: 'bold',
  color: '#6b7280',
  marginBottom: 10,
  textTransform: 'uppercase',
  letterSpacing: 1
},

  table: {
  marginTop: 28,
  backgroundColor: 'white',
  borderRadius: 18,
  overflow: 'hidden',
  border: '1 solid #e5e7eb'
},

  tableHeader: {
  flexDirection: 'row',
  backgroundColor: '#064e3b',
  color: 'white',
  fontWeight: 'bold',
  minHeight: 44,
  alignItems: 'center'
},

  row: {
  flexDirection: 'row',
  borderBottom: '1 solid #f3f4f6',
  alignItems: 'center',
  minHeight: 54
},

  col1: {
  width: '46%',
  paddingVertical: 14,
  paddingHorizontal: 16,
  fontSize: 12
},

col2: {
  width: '14%',
  paddingVertical: 14,
  paddingHorizontal: 10,
  textAlign: 'center',
  fontSize: 12
},

col3: {
  width: '18%',
  paddingVertical: 14,
  paddingHorizontal: 10,
  textAlign: 'center',
  fontSize: 12
},

col4: {
  width: '22%',
  paddingVertical: 14,
  paddingHorizontal: 16,
  textAlign: 'right',
  fontSize: 12,
  fontWeight: 'bold'
},

  totalBox: {
  marginTop: 32,
  alignSelf: 'flex-end',
  width: 280,
  backgroundColor: '#ffffff',
  borderRadius: 18,
  border: '1 solid #d1d5db',
  overflow: 'hidden'
},

  totalRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 18,
  borderBottom: '1 solid #f3f4f6'
},

  totalFinal: {
  backgroundColor: '#064e3b',
  color: 'white'
},
footer: {
  marginTop: 50,
  paddingTop: 24,
  borderTop: '1 solid #d1d5db',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
},

footerLeft: {
  width: '60%'
},

footerBrand: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#065f46',
  marginBottom: 6
},

footerText: {
  fontSize: 10,
  color: '#6b7280',
  lineHeight: 1.6
},

footerRight: {
  width: '30%',
  alignItems: 'flex-end'
},

badge: {
  backgroundColor: '#ecfdf5',
  color: '#065f46',
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 'bold'
}


})

export default function AlbaranPDF({
  pedido
}: any) {

  return (

    <Document>

      <Page
        size="A4"
        style={styles.page}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <View style={styles.logoBlock}>

            <Image
  src="https://frutall-direct.vercel.app/pdf/logo.png"
  style={styles.logo}
/>

            <Text style={styles.company}>
              FrutALL Direct, S.L.{'\n'}
              Distribución de Frutas y Verduras{'\n'}
              Alicante{'\n'}
              info@frutalldirect.es
            </Text>

          </View>

          <View style={styles.titleBlock}>

            <Text style={styles.title}>
              ALBARÁN
            </Text>

            <View style={styles.albaranBox}>

              <Text
  style={{
    fontSize: 12,
    marginBottom: 4
  }}
>
  Nº ALBARÁN
</Text>

<Text
  style={{
    fontSize: 20,
    fontWeight: 'bold'
  }}
>
  {pedido.id.slice(0, 8)}
</Text>

            </View>

          </View>

        </View>

        {/* CLIENTE */}

        <View style={styles.sectionRow}>

          <View style={styles.card}>

            <Text style={styles.cardTitle}>
              CLIENTE
            </Text>

            <Text
  style={{
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6
  }}
>
  Cliente FrutALL
</Text>

<Text
  style={{
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 1.6
  }}
>
  Pedido asociado:{'\n'}
  {pedido.usuario_id}
</Text>

          </View>

          <View style={styles.card}>

            <Text style={styles.cardTitle}>
              ESTADO
            </Text>

            <Text
  style={{
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065f46'
  }}
>
  {pedido.estado?.toUpperCase()}
</Text>

<Text
  style={{
    marginTop: 8,
    fontSize: 11,
    color: '#6b7280'
  }}
>
  Actualizado automáticamente
</Text>

          </View>

        </View>

        {/* TABLA */}

        <View style={styles.table}>

          <View style={styles.tableHeader}>

            <Text style={styles.col1}>
              PRODUCTO
            </Text>

            <Text style={styles.col2}>
              CANT.
            </Text>

            <Text style={styles.col3}>
              PRECIO
            </Text>

            <Text style={styles.col4}>
              TOTAL
            </Text>

          </View>

          {pedido.lineas_pedido?.map(
            (
              linea: any,
              index: number
            ) => (

              <View
                key={index}
                style={styles.row}
              >

                <View style={styles.col1}>

  <Text
    style={{
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 4
    }}
  >
    {linea.nombre_producto}
  </Text>

  <Text
    style={{
      fontSize: 10,
      color: '#6b7280'
    }}
  >
    Producto fresco seleccionado
  </Text>

</View>

                <Text style={styles.col2}>
                  {linea.cantidad}
                </Text>

                <Text style={styles.col3}>
                  {linea.precio_unitario?.toFixed(2)} €
                </Text>

                <Text style={styles.col4}>
                  {linea.subtotal?.toFixed(2)} €
                </Text>

              </View>

            )
          )}

        </View>

        {/* TOTAL */}

        <View style={styles.totalBox}>

          <View style={styles.totalRow}>

  <Text
    style={{
      fontSize: 12,
      color: '#6b7280'
    }}
  >
    SUBTOTAL
  </Text>

  <Text
    style={{
      fontSize: 14,
      fontWeight: 'bold'
    }}
  >
    {pedido.total?.toFixed(2)} €
  </Text>

</View>

          <View
  style={[
    styles.totalRow,
    styles.totalFinal
  ]}
>

  <Text
    style={{
      fontSize: 13,
      fontWeight: 'bold'
    }}
  >
    TOTAL FINAL
  </Text>

  <Text
    style={{
      fontSize: 24,
      fontWeight: 'heavy'
    }}
  >
    {pedido.total?.toFixed(2)} €
  </Text>

</View>

        </View>

<View style={styles.footer}>

  <View style={styles.footerLeft}>

    <Text style={styles.footerBrand}>
      FrutALL Direct
    </Text>

    <Text style={styles.footerText}>
      Distribución premium de frutas y verduras
      para hostelería, restauración y retail.
      {'\n'}
      Documento generado automáticamente.
    </Text>

  </View>

  <View style={styles.footerRight}>

    <Text style={styles.badge}>
      FRESH • FAST • DIRECT
    </Text>

  </View>

</View>

      </Page>

    </Document>

  )

}