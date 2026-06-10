import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { appInfo } from "../appInfo";

export type CertificateInput = {
  fullName: string;
  score: number;
  total: number;
};

function formatDateTimeSv(date: Date) {
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function centerText(
  page: any,
  text: string,
  y: number,
  size: number,
  font: any,
  color = rgb(0, 0, 0)
) {
  const { width } = page.getSize();
  const textWidth = font.widthOfTextAtSize(text, size);

  page.drawText(text, {
    x: width / 2 - textWidth / 2,
    y,
    size,
    font,
    color,
  });
}

export async function generateCertificatePdf(input: CertificateInput) {
  const { fullName, score, total } = input;

  const now = new Date();
  const issuedAt = formatDateTimeSv(now);

  const certId = (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random()}`
  )
    .toString()
    .toUpperCase();

  const pdfDoc = await PDFDocument.create();

  // A4 liggande
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const black = rgb(0, 0, 0);
  const gold = rgb(0.93, 0.67, 0.16);
  const lightGold = rgb(1, 0.96, 0.84);
  const darkGray = rgb(0.18, 0.18, 0.18);
  const lightGray = rgb(0.95, 0.95, 0.95);

  // Bakgrund
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 1, 1),
  });

  // Yttre gul ram
  page.drawRectangle({
    x: 26,
    y: 26,
    width: width - 52,
    height: height - 52,
    borderWidth: 6,
    borderColor: gold,
  });

  // Inre svart ram
  page.drawRectangle({
    x: 42,
    y: 42,
    width: width - 84,
    height: height - 84,
    borderWidth: 2,
    borderColor: black,
  });

  // Diskret bakgrundsplatta
  page.drawRectangle({
    x: 65,
    y: 68,
    width: width - 130,
    height: height - 136,
    color: lightGold,
    opacity: 0.35,
  });

  // Logo
  try {
    const logoUrl = "/modules/bassang/images/logo.png";
    const logoImageBytes = await fetch(logoUrl).then((res) => {
      if (!res.ok) throw new Error("Logo kunde inte laddas");
      return res.arrayBuffer();
    });

    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    const logoDims = logoImage.scale(0.22);

    page.drawImage(logoImage, {
      x: width / 2 - logoDims.width / 2,
      y: height - 115,
      width: logoDims.width,
      height: logoDims.height,
    });
  } catch (e) {
    console.warn("Kunde inte ladda logotypen till PDF:en", e);
  }

  // Rubrik
  centerText(page, "CERTIFIKAT", height - 165, 42, fontBold, black);

  centerText(
    page,
    "Härmed intygas att",
    height - 205,
    15,
    fontItalic,
    darkGray
  );

  // Namn
  const displayName = fullName.toUpperCase();

  centerText(page, displayName, height - 260, 30, fontBold, black);

  page.drawLine({
    start: { x: 210, y: height - 272 },
    end: { x: width - 210, y: height - 272 },
    thickness: 1.5,
    color: gold,
  });

  // Kursinfo
  centerText(
    page,
    "har genomfört och blivit godkänd i",
    height - 315,
    14,
    font,
    darkGray
  );

  centerText(page, appInfo.courseName, height - 350, 22, fontBold, black);

  centerText(
    page,
    "Digital städutbildning – Hylliebadet",
    height - 378,
    13,
    font,
    darkGray
  );

  // Resultatruta
  const boxWidth = 430;
  const boxHeight = 58;
  const boxX = width / 2 - boxWidth / 2;
  const boxY = height - 465;

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: rgb(1, 1, 1),
    borderWidth: 1.5,
    borderColor: gold,
  });

  centerText(
    page,
    `RESULTAT: ${score} / ${total}  ·  GODKÄND`,
    boxY + 35,
    14,
    fontBold,
    black
  );

  centerText(
    page,
    `Utfärdat: ${issuedAt}`,
    boxY + 15,
    10,
    font,
    darkGray
  );

  // Signatur / ansvarig
  page.drawLine({
    start: { x: 105, y: 105 },
    end: { x: 295, y: 105 },
    thickness: 1,
    color: black,
  });

  page.drawText("Utbildningsansvarig", {
    x: 135,
    y: 88,
    size: 10,
    font,
    color: darkGray,
  });

  page.drawLine({
    start: { x: width - 295, y: 105 },
    end: { x: width - 105, y: 105 },
    thickness: 1,
    color: black,
  });

  page.drawText("Hylliebadet", {
    x: width - 245,
    y: 88,
    size: 10,
    font,
    color: darkGray,
  });

  // Verifiering
  page.drawRectangle({
    x: 82,
    y: 48,
    width: width - 164,
    height: 28,
    color: lightGray,
  });

  page.drawText(`Certifikat-ID: ${certId}`, {
    x: 95,
    y: 58,
    size: 8,
    font: fontBold,
    color: black,
  });

  page.drawText(`Version: ${appInfo.version}`, {
    x: width - 180,
    y: 58,
    size: 8,
    font,
    color: darkGray,
  });

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
