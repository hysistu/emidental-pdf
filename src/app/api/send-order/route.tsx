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
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

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

function extensionFor(type: string, fallbackName: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/heic" || type === "image/heif") return "heic";
  const fromName = fallbackName.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  return "jpg";
}

async function readImageAttachment(
  file: File | null,
  label: string,
): Promise<{ filename: string; content: Buffer; contentType: string } | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_IMAGE_TYPES.has(file.type) && !file.type.startsWith("image/")) {
    throw new Error(`Formati i fotos (${label}) nuk mbështetet.`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Fotoja (${label}) duhet të jetë ≤ 5 MB.`);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionFor(file.type, file.name);
  return {
    filename: `${label}.${ext}`,
    content: buffer,
    contentType: file.type || "image/jpeg",
  };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body: unknown;
    let retractedFile: File | null = null;
    let smileFile: File | null = null;

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
      const retracted = form.get("retractedImage");
      const smile = form.get("smileImage");
      retractedFile = retracted instanceof File ? retracted : null;
      smileFile = smile instanceof File ? smile : null;
    } else {
      body = await request.json();
    }

    const parsed = orderSchema.safeParse({
      ...(body as object),
      hasRetractedImage: Boolean(retractedFile) || Boolean((body as OrderFormData)?.hasRetractedImage),
      hasSmileImage: Boolean(smileFile) || Boolean((body as OrderFormData)?.hasSmileImage),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Të dhënat e formularit janë të pavlefshme." },
        { status: 400 },
      );
    }

    const retractedAttachment = await readImageAttachment(
      retractedFile,
      "retracted",
    );
    const smileAttachment = await readImageAttachment(smileFile, "smile");

    const data: OrderFormData = {
      ...(parsed.data as OrderFormData),
      hasRetractedImage: Boolean(retractedAttachment),
      hasSmileImage: Boolean(smileAttachment),
    };

    const blob = await pdf(<OrderPdf data={data} />).toBlob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const safePatient = data.patientName.replace(/[^\w\-]+/g, "-").slice(0, 40);
    const filename = `EMI-Dental-Porosi-${safePatient}-${data.acceptanceDate}.pdf`;

    const transporter = getGmailTransport();
    const gmailUser = process.env.GMAIL_USER?.trim() || "";
    const labTo = process.env.LAB_EMAIL?.trim() || "hysen.stublla@gmail.com";
    const fromName = process.env.GMAIL_FROM_NAME?.trim() || "EMI Dental Lab";

    const attachments = [
      {
        filename,
        content: buffer,
        contentType: "application/pdf",
      },
      ...(retractedAttachment ? [retractedAttachment] : []),
      ...(smileAttachment ? [smileAttachment] : []),
    ];

    if (!transporter) {
      if (process.env.NODE_ENV === "development") {
        console.info("[send-order] Gmail credentials missing — PDF OK (dev dry-run)", {
          bytes: buffer.length,
          filename,
          to: labTo,
          photos: attachments.length - 1,
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
    if (err instanceof Error && /≤ 5 MB|nuk mbështetet/i.test(err.message)) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    const message =
      err instanceof Error && /Invalid login|Username and Password not accepted/i.test(err.message)
        ? "Gmail login dështoi — kontrolloni GMAIL_USER dhe App Password."
        : "Nuk u gjenerua ose u dërgua PDF-ja.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
