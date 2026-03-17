import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { appInfo } from "../appInfo";

export type CertificateInput = {
  fullName: string;
  score: number;
  total: number;
};

function formatDateTimeSv(date: Date) {
  return date.toLocaleString("sv-SE");
}

export async function generateCertificatePdf(input: CertificateInput) {
  const { fullName, score, total } = input;
  const now = new Date();
  const issuedAt = formatDateTimeSv(now);
  const certId = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
    .toString()
    .toUpperCase();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  try {
    const logoUrl = "/modules/bassang/images/logo.png";
    const logoImageBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());

    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    const logoDims = logoImage.scale(0.4);

    page.drawImage(logoImage, {
      x: width / 2 - logoDims.width / 2,
      y: height - 120,
      width: logoDims.width,
      height: logoDims.height,
    });
  } catch (e) {
    console.warn("Kunde inte ladda logotypen till PDF:en", e);
  }

  page.drawRectangle({
    x: 0,
    y: height - 10,
    width: width,
    height: 10,
    color: rgb(0.98, 0.75, 0.14),
  });

  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderWidth: 3,
    borderColor: rgb(0, 0, 0),
  });

  const marginX = 60;
  let y = height - 180;

  page.drawText("CERTIFIKAT", {
    x: width / 2 - 90,
    y,
    size: 34,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  y -= 60;

  const nameWidth = fontBold.widthOfTextAtSize(fullName.toUpperCase(), 24);
  page.drawText(fullName.toUpperCase(), {
    x: width / 2 - nameWidth / 2,
    y,
    size: 24,
    font: fontBold,
  });

  y -= 10;
  page.drawLine({
    start: { x: marginX, y },
    end: { x: width - marginX, y },
    thickness: 2,
    color: rgb(0, 0, 0),
  });

  y -= 40;

  page.drawText(appInfo.courseName, { x: marginX, y, size: 16, font: fontBold });
  y -= 20;
  page.drawText("Digital städutbildning – Hylliebadet", { x: marginX, y, size: 12, font });

  y -= 60;

  const drawInfo = (label: string, value: string, currentY: number) => {
    page.drawText(label, { x: marginX, y: currentY, size: 11, font: fontBold });
    page.drawText(value, { x: marginX + 100, y: currentY, size: 11, font });
  };

  drawInfo("RESULTAT:", `${score} / ${total} (GODKÄND)`, y);
  y -= 20;
  drawInfo("UTFÄRDAD:", issuedAt, y);
  y -= 20;
  drawInfo("VERSION:", appInfo.version, y);
  y -= 20;
  drawInfo("ID:", certId, y);

  page.drawRectangle({
    x: marginX,
    y: 70,
    width: width - marginX * 2,
    height: 30,
    color: rgb(0.95, 0.95, 0.95),
  });

  page.drawText(
    "Detta certifikat är genererat digitalt. Verifiera ID mot utbildningsansvarig.",
    { x: marginX + 10, y: 82, size: 8, font }
  );

  const bytes = await pdfDoc.save();
  return { bytes, certId };
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const safeBytes = new Uint8Array(bytes);
  const blob = new Blob([safeBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
