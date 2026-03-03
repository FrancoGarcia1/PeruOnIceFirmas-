import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
  },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 20,
    textDecoration: "underline",
  },
  legalText: {
    lineHeight: 1.6,
    textAlign: "justify",
    marginBottom: 20,
  },
  signConformity: {
    marginBottom: 20,
    fontFamily: "Helvetica-Bold",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  label: {
    fontFamily: "Helvetica-Bold",
    width: 200,
  },
  value: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 2,
  },
  signatureSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  signatureBox: {
    width: 200,
    height: 80,
    borderWidth: 1,
    borderColor: "#333",
    marginTop: 5,
  },
  signatureImage: {
    width: 200,
    height: 80,
    objectFit: "contain",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
  },
  minorCard: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    marginBottom: 8,
    borderRadius: 4,
  },
  minorRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  minorLabel: {
    fontFamily: "Helvetica-Bold",
    width: 180,
    fontSize: 10,
  },
  minorValue: {
    flex: 1,
    fontSize: 10,
  },
});

interface Minor {
  minor_name: string;
  minor_dni: string | null;
  minor_age: number;
}

interface ContractPDFProps {
  adultName: string;
  adultDni: string;
  signedAt: string;
  signatureBase64: string | null;
  minors: Minor[];
}

export default function ContractPDF({
  adultName,
  adultDni,
  signedAt,
  signatureBase64,
  minors,
}: ContractPDFProps) {
  const formattedDate = new Date(signedAt).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          DECLARACIÓN JURADA DE DESLINDE DE RESPONSABILIDADES
        </Text>

        <Text style={styles.legalText}>
          Con la suscripción de la presente declaración, manifiesto expresamente
          que tuve oportunidad de leer el contenido completo de: &quot;Documento
          de aceptación de condiciones, delimitación de responsabilidades y
          normas de uso de la pista de patinaje&quot; (el cual se muestra en el
          QR del presente documento); que lo entiendo, que comprendo sus alcances
          legales, que he sido informado correcta y oportunamente de los riesgos
          que se puedan presentar con mi participación en las actividades ahí
          descritas.
        </Text>

        <Text style={styles.signConformity}>
          Firmo en señal de conformidad:
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>FECHA:</Text>
          <Text style={styles.value}>{formattedDate}</Text>
        </View>

        <View style={styles.signatureSection}>
          <Text style={styles.label}>FIRMA:</Text>
          {signatureBase64 ? (
            <Image src={signatureBase64} style={styles.signatureImage} />
          ) : (
            <View style={styles.signatureBox} />
          )}
        </View>

        <Text style={styles.sectionTitle}>ADULTO RESPONSABLE</Text>

        <View style={styles.row}>
          <Text style={styles.label}>NOMBRE COMPLETO:</Text>
          <Text style={styles.value}>{adultName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>DOCUMENTO DE IDENTIDAD:</Text>
          <Text style={styles.value}>{adultDni}</Text>
        </View>

        {minors.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>MENORES</Text>
            {minors.map((minor, index) => (
              <View key={index} style={styles.minorCard}>
                <View style={styles.minorRow}>
                  <Text style={styles.minorLabel}>
                    NOMBRE COMPLETO DEL MENOR:
                  </Text>
                  <Text style={styles.minorValue}>{minor.minor_name}</Text>
                </View>
                <View style={styles.minorRow}>
                  <Text style={styles.minorLabel}>
                    DOCUMENTO DE IDENTIDAD:
                  </Text>
                  <Text style={styles.minorValue}>
                    {minor.minor_dni ?? "-"}
                  </Text>
                </View>
                <View style={styles.minorRow}>
                  <Text style={styles.minorLabel}>EDAD:</Text>
                  <Text style={styles.minorValue}>
                    {minor.minor_age} años
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
