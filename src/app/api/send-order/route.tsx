import { pdf } from "@react-pdf/renderer";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/schema";
import { buildOrderEmailHtml, buildOrderEmailText } from "@/lib/order-email";
import { OrderPdf } from "@/pdf/OrderPdf";
import type { OrderFormData } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_STL_BYTES = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

function getGmailTransport() {
  const user = process.env.GMAIL_USER?.trim().replace(/^["']|["']$/g, "");
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "").replace(
    /^["']|["']$/g,
    "",
  );

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

function extensionForImage(type: string, fallbackName: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/heic" || type === "image/heif") return "heic";
  const fromName = fallbackName.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  return "jpg";
}

function scanExt(file: File): "stl" | "ply" | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".stl")) return "stl";
  if (name.endsWith(".ply")) return "ply";
  const type = file.type.toLowerCase();
  if (
    type === "model/stl" ||
    type === "application/sla" ||
    type === "application/vnd.ms-pki.stl"
  ) {
    return "stl";
  }
  if (type === "model/ply" || type === "application/ply") return "ply";
  return null;
}

function isScanFile(file: File) {
  return scanExt(file) != null;
}

function asFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size > 0 ? value : null;
}

async function readImageAttachment(
  file: File | null,
  label: string,
): Promise<MailAttachment | null> {
  if (!file) return null;
  if (!ALLOWED_IMAGE_TYPES.has(file.type) && !file.type.startsWith("image/")) {
    throw new Error(`Formati i fotos (${label}) nuk mbështetet.`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Fotoja (${label}) duhet të jetë ≤ 5 MB.`);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionForImage(file.type, file.name);
  return {
    filename: `${label}.${ext}`,
    content: buffer,
    contentType: file.type || "image/jpeg",
  };
}

async function readStlAttachment(
  file: File | null,
  label: string,
): Promise<MailAttachment | null> {
  if (!file) return null;
  const ext = scanExt(file);
  if (!ext) {
    throw new Error(`Skedari (${label}) duhet të jetë .STL ose .PLY.`);
  }
  if (file.size > MAX_STL_BYTES) {
    throw new Error(`Skanimi (${label}) duhet të jetë ≤ 50 MB.`);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    filename: `${label}.${ext}`,
    content: buffer,
    contentType: ext === "ply" ? "model/ply" : "model/stl",
  };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body: unknown;
    let retractedFile: File | null = null;
    let smileFile: File | null = null;
    let upperJawFile: File | null = null;
    let lowerJawFile: File | null = null;
    let biteFile: File | null = null;
    let bite2File: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const raw = form.get("order");
      if (typeof raw !== "string") {
        return NextResponse.json(
          { ok: false, error: "Mungojnë të dhënat e porosisë." },
          { status: 400 },
        );
      }
      body = JSON.parse(raw);
      retractedFile = asFile(form.get("retractedImage"));
      smileFile = asFile(form.get("smileImage"));
      upperJawFile = asFile(form.get("upperJawScan"));
      lowerJawFile = asFile(form.get("lowerJawScan"));
      biteFile = asFile(form.get("biteScan"));
      bite2File = asFile(form.get("biteScan2"));
    } else {
      body = await request.json();
    }

    const bodyData = body as OrderFormData;
    const parsed = orderSchema.safeParse({
      ...(body as object),
      hasRetractedImage: Boolean(retractedFile) || Boolean(bodyData?.hasRetractedImage),
      hasSmileImage: Boolean(smileFile) || Boolean(bodyData?.hasSmileImage),
      hasUpperJawScan: Boolean(upperJawFile) || Boolean(bodyData?.hasUpperJawScan),
      hasLowerJawScan: Boolean(lowerJawFile) || Boolean(bodyData?.hasLowerJawScan),
      hasBiteScan: Boolean(biteFile) || Boolean(bodyData?.hasBiteScan),
      hasBiteScan2: Boolean(bite2File) || Boolean(bodyData?.hasBiteScan2),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Të dhënat e formularit janë të pavlefshme." },
        { status: 400 },
      );
    }

    const [
      retractedAttachment,
      smileAttachment,
      upperJawAttachment,
      lowerJawAttachment,
      biteAttachment,
      bite2Attachment,
    ] = await Promise.all([
      readImageAttachment(retractedFile, "retracted"),
      readImageAttachment(smileFile, "smile"),
      readStlAttachment(upperJawFile, "upper-jaw-scan"),
      readStlAttachment(lowerJawFile, "lower-jaw-scan"),
      readStlAttachment(biteFile, "bite-scan"),
      readStlAttachment(bite2File, "bite-scan-2"),
    ]);

    const data: OrderFormData = {
      ...(parsed.data as OrderFormData),
      hasRetractedImage: Boolean(retractedAttachment),
      hasSmileImage: Boolean(smileAttachment),
      hasUpperJawScan: Boolean(upperJawAttachment),
      hasLowerJawScan: Boolean(lowerJawAttachment),
      hasBiteScan: Boolean(biteAttachment),
      hasBiteScan2: Boolean(bite2Attachment),
    };

    const blob = await pdf(<OrderPdf data={data} />).toBlob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const safePatient = data.patientName.replace(/[^\w\-]+/g, "-").slice(0, 40);
    const filename = `EMI-Dental-Porosi-${safePatient}-${data.acceptanceDate}.pdf`;

    const transporter = getGmailTransport();
    const gmailUser = process.env.GMAIL_USER?.trim() || "";
    const labTo = process.env.LAB_EMAIL?.trim() || "hysen.stublla@gmail.com";
    const fromName = process.env.GMAIL_FROM_NAME?.trim() || "EMI Dental Lab";

    const fileAttachments = [
      retractedAttachment,
      smileAttachment,
      upperJawAttachment,
      lowerJawAttachment,
      biteAttachment,
      bite2Attachment,
    ].filter(Boolean) as MailAttachment[];

    const attachments = [
      {
        filename,
        content: buffer,
        contentType: "application/pdf",
      },
      ...fileAttachments,
    ];

    if (!transporter) {
      if (process.env.NODE_ENV === "development") {
        console.info("[send-order] Gmail credentials missing — PDF OK (dev dry-run)", {
          bytes: buffer.length,
          filename,
          to: labTo,
          files: fileAttachments.length,
        });
        return NextResponse.json({
          ok: true,
          dryRun: true,
          message: "PDF u gjenerua (dev mode pa email).",
        });
      }
      return NextResponse.json(
        { ok: false, error: "Gmail nuk është konfiguruar (GMAIL_USER / GMAIL_APP_PASSWORD)." },
        { status: 500 },
      );
    }

    const subject = `Porosi e re — ${data.patientName} (${data.doctorName})`;

    await transporter.sendMail({
      from: `"${fromName}" <${gmailUser}>`,
      to: labTo,
      cc: data.contactEmail || undefined,
      replyTo: data.contactEmail || undefined,
      subject,
      text: buildOrderEmailText(data),
      html: buildOrderEmailHtml(data),
      attachments,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-order]", err);
    if (
      err instanceof Error &&
      /≤ 5 MB|≤ 50 MB|nuk mbështetet|duhet të jetë \.STL|duhet të jetë \.STL ose \.PLY/i.test(err.message)
    ) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    const message =
      err instanceof Error && /Invalid login|Username and Password not accepted/i.test(err.message)
        ? "Gmail login dështoi — kontrolloni GMAIL_USER dhe App Password."
        : err instanceof Error && /Message size exceeds|attachment/i.test(err.message)
          ? "Bashkangjitjet janë shumë të mëdha për email (Gmail ~25 MB gjithsej)."
          : "Nuk u gjenerua ose u dërgua PDF-ja.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
