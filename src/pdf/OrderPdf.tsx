import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { LAB, MATERIAL_LABELS, UPPER_TEETH, LOWER_TEETH } from "@/lib/constants";
import type { OrderFormData } from "@/lib/types";

const blue = "#1B6FB5";
const grey = "#5A6270";
const lightGrey = "#E8EAED";
const dark = "#1F2933";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: dark,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  brand: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: blue,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 9,
    color: grey,
    marginTop: 2,
  },
  sectionBar: {
    backgroundColor: lightGrey,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: grey,
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 7,
    gap: 8,
  },
  field: {
    flexGrow: 1,
  },
  label: {
    fontSize: 8,
    color: grey,
    marginBottom: 2,
  },
  value: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#9AA3AF",
    paddingBottom: 2,
    minHeight: 12,
    fontSize: 10,
  },
  hint: {
    fontSize: 7,
    color: "#9AA3AF",
    marginTop: 1,
  },
  instruction: {
    fontSize: 8,
    color: blue,
    marginBottom: 6,
  },
  toothRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 3,
    marginBottom: 4,
  },
  tooth: {
    width: 18,
    height: 22,
    borderWidth: 0.8,
    borderColor: "#CBD2D9",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  toothSelected: {
    backgroundColor: blue,
    borderColor: blue,
  },
  toothText: {
    fontSize: 6,
    color: grey,
  },
  toothTextSelected: {
    color: "#fff",
    fontFamily: "Helvetica-Bold",
  },
  materialsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  chip: {
    borderWidth: 0.8,
    borderColor: "#CBD2D9",
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 3,
  },
  chipActive: {
    backgroundColor: "#E8F1FA",
    borderColor: blue,
  },
  chipText: {
    fontSize: 7.5,
  },
  notes: {
    borderWidth: 0.8,
    borderColor: "#CBD2D9",
    borderRadius: 4,
    minHeight: 48,
    padding: 6,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: grey,
  },
});

function Field({
  label,
  value,
  hint,
  width,
}: {
  label: string;
  value?: string;
  hint?: string;
  width?: number | string;
}) {
  return (
    <View style={[styles.field, width ? { width, flexGrow: 0 } : {}]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || " "}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function ToothCell({ n, selected }: { n: number; selected: boolean }) {
  return (
    <View style={[styles.tooth, selected ? styles.toothSelected : {}]}>
      <Text style={[styles.toothText, selected ? styles.toothTextSelected : {}]}>
        {n}
      </Text>
    </View>
  );
}

export function OrderPdf({ data }: { data: OrderFormData }) {
  const selected = new Set(data.selectedTeeth);
  const materials = new Set(data.materials);
  const activeMaterials = (
    Object.keys(MATERIAL_LABELS) as Array<keyof typeof MATERIAL_LABELS>
  ).filter((key) => materials.has(key));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{LAB.name}</Text>
            <Text style={styles.tagline}>{LAB.tagline}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 8, color: grey, textAlign: "right" }}>
              Porosi digjitale
            </Text>
            <Text style={{ fontSize: 8, color: blue, textAlign: "right", marginTop: 2 }}>
              {data.acceptanceDate}
            </Text>
          </View>
        </View>

        <View style={styles.sectionBar}>
          <Text style={styles.sectionTitle}>TË DHËNAT E KËRKUARA</Text>
        </View>

        <View style={styles.row}>
          <Field label="Emri i Doktorit" value={data.doctorName} />
          <Field label="Telefoni" value={data.contactPhone} width={110} />
        </View>
        <View style={styles.row}>
          <Field label="Emri i Pacientit" value={data.patientName} />
          <Field label="Nr. kartela Pac#" value={data.patientCardNo} width={90} />
          <Field label="Gjinia" value={data.gender || "—"} width={40} />
          <Field label="Mosha" value={data.age} width={40} />
        </View>
        <View style={styles.row}>
          <Field label="Data e pranimit" value={data.acceptanceDate} width={140} />
          <Field
            label="Data e dorëzimit"
            value={data.deliveryDate || "Standarde (5 ditë)"}
            hint="(koha standarde e punës 5 ditë nëse nuk jepet një datë)"
          />
        </View>
        {data.contactEmail ? (
          <View style={styles.row}>
            <Field label="Email kontakti" value={data.contactEmail} />
          </View>
        ) : null}

        <View style={styles.sectionBar}>
          <Text style={styles.sectionTitle}>UDHËZIMET E RASTIT</Text>
        </View>
        <Text style={styles.instruction}>
          Njësitë e zgjedhura në hartën e dhëmbëve
        </Text>
        <Text style={{ fontSize: 7, color: grey, marginBottom: 4, textAlign: "center" }}>
          Nr. Element.
        </Text>
        <View style={styles.toothRow}>
          {UPPER_TEETH.map((n) => (
            <ToothCell key={n} n={n} selected={selected.has(n)} />
          ))}
        </View>
        <View style={styles.toothRow}>
          {LOWER_TEETH.map((n) => (
            <ToothCell key={n} n={n} selected={selected.has(n)} />
          ))}
        </View>
        <Text style={{ fontSize: 8, color: grey, marginTop: 4, marginBottom: 6 }}>
          Dhëmbët e zgjedhur:{" "}
          {data.selectedTeeth.length
            ? [...data.selectedTeeth].sort((a, b) => a - b).join(", ")
            : "—"}
        </Text>

        <View style={styles.sectionBar}>
          <Text style={styles.sectionTitle}>MATERIALET & RESTAURIMI</Text>
        </View>
        {activeMaterials.length === 0 ? (
          <Text style={{ fontSize: 8, color: grey, marginBottom: 6 }}>
            Nuk është specifikuar — dizajn standard
          </Text>
        ) : (
          <View style={styles.materialsGrid}>
            {activeMaterials.map((key) => (
              <View key={key} style={[styles.chip, styles.chipActive]}>
                <Text style={styles.chipText}>☑ {MATERIAL_LABELS[key]}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={[styles.row, { marginTop: 8 }]}>
          <Field label="Ngjyra e dhëmbit" value={data.toothColor || "—"} />
          <Field
            label="Ngjyra e kultit punues"
            value={data.stumpShade}
            hint="(KËRKOHET PËR E.MAX & ZR.ML)"
          />
        </View>

        <View style={styles.sectionBar}>
          <Text style={styles.sectionTitle}>UDHËZIME SPECIFIKE</Text>
        </View>
        <Text style={styles.instruction}>
          Ju lutemi dërgoni foto ose modele studimi në: {LAB.email}
        </Text>
        <Text style={styles.label}>Karakterizimet</Text>
        <View style={styles.notes}>
          <Text style={{ fontSize: 9, lineHeight: 1.4 }}>
            {data.characterizations || " "}
          </Text>
        </View>
        <Text style={[styles.hint, { marginTop: 8 }]}>
          *Dizajni standard nëse nuk specifikohen opsionet
        </Text>

        <View style={styles.footer} fixed>
          <Text>{LAB.address}</Text>
          <Text>{LAB.phone}</Text>
          <Text>©{LAB.legal}</Text>
        </View>
      </Page>
    </Document>
  );
}
