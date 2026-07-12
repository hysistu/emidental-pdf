import { LAB, MATERIAL_LABELS } from "@/lib/constants";
import { formatTeethSummary } from "@/lib/teeth";
import type { OrderFormData } from "@/lib/types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string) {
  if (!value.trim()) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8edf3;width:38%;vertical-align:top;">
        <span style="font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#6b7582;font-weight:600;">
          ${escapeHtml(label)}
        </span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #e8edf3;vertical-align:top;">
        <span style="font-size:15px;color:#15202b;font-weight:600;">
          ${escapeHtml(value)}
        </span>
      </td>
    </tr>
  `;
}

export function buildOrderEmailHtml(data: OrderFormData) {
  const materials = data.materials
    .map((key) => MATERIAL_LABELS[key])
    .filter(Boolean)
    .join(", ");

  const teeth = [...data.selectedTeeth].sort((a, b) => a - b).join(", ");
  const teethSplit = formatTeethSummary(data.selectedTeeth, data.bridges ?? []);
  const photos = [
    data.hasRetractedImage ? "Retracted" : "",
    data.hasSmileImage ? "Smile" : "",
  ]
    .filter(Boolean)
    .join(", ");
  const delivery = data.deliveryDate || "Standarde (5 ditë)";
  const teethSplitRows = teethSplit.map((line) => row(line.split(":")[0] ?? "Dhëmbët", line.includes(":") ? line.slice(line.indexOf(":") + 1).trim() : line)).join("");

  return `<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Porosi e re — EMI Dental Lab</title>
</head>
<body style="margin:0;padding:0;background:#eef3f8;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3f8;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 18px 50px rgba(21,64,110,0.12);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d3d66 0%,#1b6fb5 55%,#145a94 100%);padding:28px 28px 24px;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.72);">
                ${escapeHtml(LAB.tagline)}
              </p>
              <h1 style="margin:0;font-size:26px;line-height:1.15;color:#ffffff;font-weight:700;">
                EMI DENTAL LAB.
              </h1>
              <p style="margin:12px 0 0;font-size:14px;color:rgba(255,255,255,0.88);">
                Porosi e re digjitale · PDF i bashkangjitur
              </p>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td style="padding:22px 28px 0;">
              <span style="display:inline-block;background:#e8f2fa;color:#145a94;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:7px 12px;border-radius:999px;">
                Porosi e re
              </span>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:14px 28px 8px;">
              <p style="margin:0;font-size:15px;line-height:1.55;color:#4a5562;">
                U pranua një porosi e re nga
                <strong style="color:#15202b;">${escapeHtml(data.doctorName)}</strong>
                për pacientin
                <strong style="color:#15202b;">${escapeHtml(data.patientName)}</strong>.
              </p>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:8px 28px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${row("Doktori", data.doctorName)}
                ${row("Pacienti", data.patientName)}
                ${row("Nr. kartela", data.patientCardNo)}
                ${row("Gjinia", data.gender === "M" ? "Mashkull" : data.gender === "F" ? "Femër" : "")}
                ${row("Mosha", data.age ? `${data.age} vjeç` : "")}
                ${row("Data e pranimit", data.acceptanceDate)}
                ${row("Data e dorëzimit", delivery)}
                ${row("Dhëmbët", teeth)}
                ${teethSplitRows}
                ${row("Materialet", materials || "Dizajn standard")}
                ${row("Ngjyra e dhëmbit", data.toothColor)}
                ${row("Ngjyra e kultit", data.stumpShade)}
                ${row("Foto", photos)}
                ${row("Telefoni", data.contactPhone)}
                ${row("Email", data.contactEmail)}
              </table>
            </td>
          </tr>

          ${
            data.characterizations.trim()
              ? `
          <tr>
            <td style="padding:8px 28px 4px;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#6b7582;font-weight:600;">
                Shënime
              </p>
              <div style="background:#f5f8fb;border:1px solid #e0e7ef;border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.55;color:#15202b;">
                ${escapeHtml(data.characterizations).replace(/\n/g, "<br/>")}
              </div>
            </td>
          </tr>`
              : ""
          }

          <!-- Attachment note -->
          <tr>
            <td style="padding:18px 28px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f7fc;border:1px solid #cfe3f4;border-radius:14px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#145a94;">
                      📎 Bashkangjitjet
                    </p>
                    <p style="margin:0;font-size:13px;line-height:1.5;color:#4a5562;">
                      Formular PDF${
                        photos
                          ? ` + foto: ${escapeHtml(photos)}`
                          : ""
                      }. Hapni bashkangjitjet për detajet e plota.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 28px 26px;">
              <div style="height:1px;background:#e8edf3;margin-bottom:16px;"></div>
              <p style="margin:0 0 4px;font-size:12px;color:#6b7582;">
                ${escapeHtml(LAB.address)}
              </p>
              <p style="margin:0 0 4px;font-size:12px;color:#6b7582;">
                ${escapeHtml(LAB.phone)} · ${escapeHtml(LAB.email)}
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#9aa3af;">
                © ${escapeHtml(LAB.legal)}
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 0;font-size:11px;color:#9aa3af;text-align:center;">
          Ky email u gjenerua automatikisht nga porosia digjitale EMI Dental Lab.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildOrderEmailText(data: OrderFormData) {
  const materials = data.materials
    .map((key) => MATERIAL_LABELS[key])
    .filter(Boolean)
    .join(", ");

  const teethSplit = formatTeethSummary(data.selectedTeeth, data.bridges ?? []);
  const photos = [
    data.hasRetractedImage ? "Retracted" : "",
    data.hasSmileImage ? "Smile" : "",
  ]
    .filter(Boolean)
    .join(", ");

  return [
    `Porosi e re — EMI Dental Lab`,
    ``,
    `Doktori: ${data.doctorName}`,
    `Pacienti: ${data.patientName}`,
    data.patientCardNo ? `Nr. kartela: ${data.patientCardNo}` : "",
    `Data e pranimit: ${data.acceptanceDate}`,
    `Data e dorëzimit: ${data.deliveryDate || "Standarde (5 ditë)"}`,
    `Dhëmbët: ${[...data.selectedTeeth].sort((a, b) => a - b).join(", ")}`,
    ...teethSplit,
    `Materialet: ${materials || "Dizajn standard"}`,
    data.toothColor ? `Ngjyra: ${data.toothColor}` : "",
    data.stumpShade ? `Ngjyra e kultit: ${data.stumpShade}` : "",
    photos ? `Foto: ${photos}` : "",
    data.contactPhone ? `Telefoni: ${data.contactPhone}` : "",
    data.contactEmail ? `Email: ${data.contactEmail}` : "",
    data.characterizations ? `\nShënime:\n${data.characterizations}` : "",
    ``,
    `PDF-ja e plotë e porosisë është bashkangjitur.`,
    `${LAB.phone} · ${LAB.address}`,
  ]
    .filter(Boolean)
    .join("\n");
}
