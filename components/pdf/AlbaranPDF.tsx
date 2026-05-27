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
    marginBottom: 30
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
    width: '45%',
    alignItems: 'flex-end'
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 12
  },

  albaranBox: {
    backgroundColor: '#065f46',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold'
  },

  sectionRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20
  },

  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    border: '1 solid #d1d5db'
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 10
  },

  table: {
    marginTop: 20,
    border: '1 solid #d1d5db',
    borderRadius: 10,
    overflow: 'hidden'
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#065f46',
    color: 'white',
    fontWeight: 'bold'
  },

  row: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    alignItems: 'center'
  },

  col1: {
    width: '40%',
    padding: 10
  },

  col2: {
    width: '20%',
    padding: 10,
    textAlign: 'center'
  },

  col3: {
    width: '20%',
    padding: 10,
    textAlign: 'center'
  },

  col4: {
    width: '20%',
    padding: 10,
    textAlign: 'right'
  },

  totalBox: {
    marginTop: 24,
    alignSelf: 'flex-end',
    width: 220,
    backgroundColor: 'white',
    borderRadius: 10,
    border: '1 solid #d1d5db',
    overflow: 'hidden'
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottom: '1 solid #e5e7eb'
  },

  totalFinal: {
    backgroundColor: '#065f46',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18
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
              src="/pdf/logo.png"
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

              <Text>
                Nº {pedido.id}
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

            <Text>
              {pedido.usuario_id}
            </Text>

          </View>

          <View style={styles.card}>

            <Text style={styles.cardTitle}>
              ESTADO
            </Text>

            <Text>
              {pedido.estado}
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

                <Text style={styles.col1}>
                  {linea.nombre_producto}
                </Text>

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

            <Text>
              TOTAL
            </Text>

            <Text>
              {pedido.total?.toFixed(2)} €
            </Text>

          </View>

          <View
            style={[
              styles.totalRow,
              styles.totalFinal
            ]}
          >

            <Text>
              TOTAL FINAL
            </Text>

            <Text>
              {pedido.total?.toFixed(2)} €
            </Text>

          </View>

        </View>

      </Page>

    </Document>

  )

}