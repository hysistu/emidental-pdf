import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { LAB, MATERIAL_LABELS, UPPER_TEETH, LOWER_TEETH } from "@/lib/constants";
import { formatTeethSummary } from "@/lib/teeth";
import type { OrderFormData } from "@/lib/types";

/** A5 portrait: 148 × 210 mm ≈ 419.53 × 595.28 pt */
const PAGE_W = 419.53;
const PAGE_H = 595.28;
/** ~8 mm margins — safe for most A5 printers */
const MARGIN = 22;

const blue = "#1B6FB5";
const grey = "#5A6270";
const lightGrey = "#E8EAED";
const dark = "#1F2933";
const amber = "#B45309";

const styles = StyleSheet.create({
  page: {
    width: PAGE_W,
    height: PAGE_H,
    paddingTop: MARGIN,
    paddingBottom: MARGIN + 14,
    paddingHorizontal: MARGIN,
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: dark,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: blue,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 7,
    color: grey,
    marginTop: 1,
  },
  sectionBar: {
    backgroundColor: lightGrey,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 7,
    marginTop: 6,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: grey,
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
    gap: 5,
  },
  field: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 6.5,
    color: grey,
    marginBottom: 1,
  },
  value: {
    borderBottomWidth: 0.6,
    borderBottomColor: "#9AA3AF",
    paddingBottom: 1,
    minHeight: 10,
    fontSize: 8,
  },
  hint: {
    fontSize: 5.5,
    color: "#9AA3AF",
    marginTop: 1,
  },
  instruction: {
    fontSize: 6.5,
    color: blue,
    marginBottom: 3,
  },
  toothRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 1.5,
    marginBottom: 2,
  },
  tooth: {
    width: 13.5,
    height: 16,
    borderWidth: 0.6,
    borderColor: "#CBD2D9",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  toothSelected: {
    backgroundColor: blue,
    borderColor: blue,
  },
  toothText: {
    fontSize: 5,
    color: grey,
  },
  toothTextSelected: {
    color: "#fff",
    fontFamily: "Helvetica-Bold",
  },
  toothBridgeDot: {
    position: "absolute",
    top: 0.5,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: "#F59E0B",
  },
  materialsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  chip: {
    borderWidth: 0.6,
    borderColor: "#CBD2D9",
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  chipActive: {
    backgroundColor: "#E8F1FA",
    borderColor: blue,
  },
  chipText: {
    fontSize: 6.5,
  },
  notes: {
    borderWidth: 0.6,
    borderColor: "#CBD2D9",
    borderRadius: 3,
    minHeight: 28,
    padding: 4,
    marginTop: 2,
  },
  summaryLine: {
    fontSize: 6.5,
    marginBottom: 1,
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: MARGIN,
    right: MARGIN,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 5.5,
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
    <View style={[styles.field, width ? { width, flexGrow: 0, flexShrink: 0 } : {}]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || " "}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function ToothCell({
  n,
  selected,
  bridged,
}: {
  n: number;
  selected: boolean;
  bridged: boolean;
}) {
  return (
    <View style={[styles.tooth, selected ? styles.toothSelected : {}]}>
      {bridged ? <View style={styles.toothBridgeDot} /> : null}
      <Text style={[styles.toothText, selected ? styles.toothTextSelected : {}]}>
        {n}
      </Text>
    </View>
  );
}

function attachmentLine(data: OrderFormData) {
  const photos = [
    data.hasRetractedImage ? "Retracted" : null,
    data.hasSmileImage ? "Smile" : null,
  ].filter(Boolean);
  const scans = [
    data.hasUpperJawScan ? "Upper jaw" : null,
    data.hasLowerJawScan ? "Lower jaw" : null,
    data.hasBiteScan ? "Bite" : null,
    data.hasBiteScan2 ? "Bite 2" : null,
  ].filter(Boolean);
  const parts = [
    photos.length ? `Foto: ${photos.join(", ")}` : null,
    scans.length ? `STL/PLY: ${scans.join(", ")}` : null,
  ].filter(Boolean);
  return parts.length
    ? `Bashkangjitjet: ${parts.join(" · ")}`
    : `Foto/modele: ${LAB.email}`;
}

export function OrderPdf({ data }: { data: OrderFormData }) {
  const selected = new Set(data.selectedTeeth);
  const bridged = new Set((data.bridges ?? []).flat());
  const materials = new Set(data.materials);
  const activeMaterials = (
    Object.keys(MATERIAL_LABELS) as Array<keyof typeof MATERIAL_LABELS>
  ).filter((key) => materials.has(key));
  const summaryLines = formatTeethSummary(
    data.selectedTeeth,
    data.bridges ?? [],
  );

  return (
    <Document>
      <Page size="A5" style={styles.page} wrap>
        <View style={styles.header} fixed={false}>
          <View>
            <Text style={styles.brand}>{LAB.name}</Text>
            <Text style={styles.tagline}>{LAB.tagline}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 6.5, color: grey, textAlign: "right" }}>
              Porosi digjitale · A5
            </Text>
            <Text
              style={{
                fontSize: 7,
                color: blue,
                textAlign: "right",
                marginTop: 1,
              }}
            >
              {data.acceptanceDate}
            </Text>
          </View>
        </View>

        <View style={styles.sectionBar}>
          <Text style={styles.sectionTitle}>TË DHËNAT E KËRKUARA</Text>
        </View>

        <View style={styles.row}>
          <Field label="Emri i Doktorit" value={data.doctorName} />
          <Field label="Telefoni" value={data.contactPhone} width={88} />
        </View>
        <View style={styles.row}>
          <Field label="Emri i Pacientit" value={data.patientName} />
          <Field label="Nr. kartela" value={data.patientCardNo} width={70} />
          <Field label="Gjinia" value={data.gender || "—"} width={32} />
          <Field label="Mosha" value={data.age} width={32} />
        </View>
        <View style={styles.row}>
          <Field label="Data e pranimit" value={data.acceptanceDate} width={100} />
          <Field
            label="Data e dorëzimit"
            value={data.deliveryDate || "Standarde (5 ditë)"}
            hint="(standarde 5 ditë nëse bosh)"
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
        <Text style={{ fontSize: 6, color: grey, marginBottom: 2, textAlign: "center" }}>
          Nr. Element.
        </Text>
        <View style={styles.toothRow}>
          {UPPER_TEETH.map((n) => (
            <ToothCell
              key={n}
              n={n}
              selected={selected.has(n)}
              bridged={bridged.has(n)}
            />
          ))}
        </View>
        <View style={styles.toothRow}>
          {LOWER_TEETH.map((n) => (
            <ToothCell
              key={n}
              n={n}
              selected={selected.has(n)}
              bridged={bridged.has(n)}
            />
          ))}
        </View>
        <Text style={{ fontSize: 6.5, color: grey, marginTop: 3, marginBottom: 1 }}>
          Dhëmbët:{" "}
          {data.selectedTeeth.length
            ? [...data.selectedTeeth].sort((a, b) => a - b).join(", ")
            : "—"}
        </Text>
        {summaryLines.map((line) => (
          <Text
            key={line}
            style={[
              styles.summaryLine,
              { color: line.startsWith("Urë") ? amber : grey },
            ]}
          >
            {line}
          </Text>
        ))}

        <View style={styles.sectionBar} wrap={false}>
          <Text style={styles.sectionTitle}>MATERIALET & RESTAURIMI</Text>
        </View>
        {activeMaterials.length === 0 ? (
          <Text style={{ fontSize: 6.5, color: grey, marginBottom: 4 }}>
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
        <View style={[styles.row, { marginTop: 4 }]} wrap={false}>
          <Field label="Ngjyra e dhëmbit" value={data.toothColor || "—"} />
          <Field
            label="Ngjyra e kultit"
            value={data.stumpShade}
            hint="(E.MAX & ZR.ML)"
          />
        </View>

        <View style={styles.sectionBar} wrap={false}>
          <Text style={styles.sectionTitle}>UDHËZIME SPECIFIKE</Text>
        </View>
        <Text style={styles.instruction}>{attachmentLine(data)}</Text>
        <Text style={styles.label}>Karakterizimet</Text>
        <View style={styles.notes}>
          <Text style={{ fontSize: 7.5, lineHeight: 1.35 }}>
            {data.characterizations || " "}
          </Text>
        </View>
        <Text style={[styles.hint, { marginTop: 4 }]}>
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
