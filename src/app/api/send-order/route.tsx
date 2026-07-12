import { pdf } from "@react-pdf/renderer";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/schema";
import { buildOrderEmailHtml, buildOrderEmailText } from "@/lib/order-email";
import { OrderPdf } from "@/pdf/OrderPdf";
import type { OrderFormData } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Të dhënat e formularit janë të pavlefshme." },
        { status: 400 },
      );
    }

    const data = parsed.data as OrderFormData;
    const blob = await pdf(<OrderPdf data={data} />).toBlob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const safePatient = data.patientName.replace(/[^\w\-]+/g, "-").slice(0, 40);
    const filename = `EMI-Dental-Porosi-${safePatient}-${data.acceptanceDate}.pdf`;

    const transporter = getGmailTransport();
    const gmailUser = process.env.GMAIL_USER?.trim() || "";
    const labTo = process.env.LAB_EMAIL?.trim() || "hysen.stublla@gmail.com";
    const fromName = process.env.GMAIL_FROM_NAME?.trim() || "EMI Dental Lab";

    if (!transporter) {
      if (process.env.NODE_ENV === "development") {
        console.info("[send-order] Gmail credentials missing — PDF OK (dev dry-run)", {
          bytes: buffer.length,
          filename,
          to: labTo,
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
      attachments: [
        {
          filename,
          content: buffer,
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-order]", err);
    const message =
      err instanceof Error && /Invalid login|Username and Password not accepted/i.test(err.message)
        ? "Gmail login dështoi — kontrolloni GMAIL_USER dhe App Password."
        : "Nuk u gjenerua ose u dërgua PDF-ja.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
