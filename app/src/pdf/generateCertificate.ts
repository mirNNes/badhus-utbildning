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

function centerTextInArea(
  page: any,
  text: string,
  areaX: number,
  areaWidth: number,
  y: number,
  size: number,
  font: any,
  color = rgb(0, 0, 0)
) {
  const textWidth = font.widthOfTextAtSize(text, size);

  page.drawText(text, {
    x: areaX + areaWidth / 2 - textWidth / 2,
    y,
    size,
    font,
    color,
  });
}

export async function generateCertificatePdf(input: CertificateInput) {
  const { fullName, score, total } = input;

  const issuedAt = formatDateTimeSv(new Date());

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
  const white = rgb(1, 1, 1);

  const contentX = 275;
  const contentWidth = width - contentX - 90;

  // Bakgrund
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: white,
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

  // Vänster dekorlinje
  page.drawLine({
    start: { x: 250, y: 145 },
    end: { x: 250, y: height - 145 },
    thickness: 1.5,
    color: gold,
  });

  // Logo till vänster
  try {
    const logoUrl = new URL(
      `${import.meta.env.BASE_URL}modules/bassang/images/logo.png`,
      window.location.origin
    ).toString();

    const response = await fetch(logoUrl);

    if (!response.ok) {
      throw new Error(`Logo kunde inte laddas: ${response.status}`);
    }

    const logoImageBytes = await response.arrayBuffer();

    let logoImage;
    try {
      logoImage = await pdfDoc.embedPng(logoImageBytes);
    } catch {
      logoImage = await pdfDoc.embedJpg(logoImageBytes);
    }

    const logoDims = logoImage.scale(0.45);

    page.drawImage(logoImage, {
      x: 115,
      y: height / 2 - logoDims.height / 2 + 5,
      width: logoDims.width,
      height: logoDims.height,
    });
  } catch (e) {
    console.warn("Kunde inte ladda logotypen till PDF:en", e);
  }

  // Rubrik
  centerTextInArea(
    page,
    "CERTIFIKAT",
    contentX,
    contentWidth,
    height - 145,
    46,
    fontBold,
    black
  );

  centerTextInArea(
    page,
    "Härmed intygas att",
    contentX,
    contentWidth,
    height - 195,
    16,
    fontItalic,
    darkGray
  );

  // Namn
  const displayName = fullName.toUpperCase();

  centerTextInArea(
    page,
    displayName,
    contentX,
    contentWidth,
    height - 242,
    32,
    fontBold,
    black
  );

  page.drawLine({
    start: { x: contentX + 70, y: height - 258 },
    end: { x: contentX + contentWidth - 70, y: height - 258 },
    thickness: 1.5,
    color: gold,
  });

  // Kursinfo
  centerTextInArea(
    page,
    "har genomfört och blivit godkänd i",
    contentX,
    contentWidth,
    height - 310,
    14,
    font,
    darkGray
  );

  centerTextInArea(
    page,
    appInfo.courseName,
    contentX,
    contentWidth,
    height - 348,
    26,
    fontBold,
    black
  );

  centerTextInArea(
    page,
    "Digital städutbildning – Hylliebadet",
    contentX,
    contentWidth,
    height - 382,
    14,
    font,
    darkGray
  );

  // Resultatruta
  const boxWidth = 430;
  const boxHeight = 62;
  const boxX = contentX + contentWidth / 2 - boxWidth / 2;
  const boxY = 142;

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: white,
    borderWidth: 2,
    borderColor: gold,
  });

  centerTextInArea(
  page,
  "KURS GENOMFÖRD MED GODKÄNT RESULTAT",
  boxX,
  boxWidth,
  boxY + 34,
  14,
  fontBold,
  black
);

centerTextInArea(
  page,
  `Utfärdat: ${issuedAt}`,
  boxX,
  boxWidth,
  boxY + 12,
  11,
  font,
  darkGray
);

  // Signatur / ansvarig
  page.drawLine({
    start: { x: contentX + 20, y: 105 },
    end: { x: contentX + 255, y: 105 },
    thickness: 1,
    color: black,
  });

  page.drawText("Utbildningsansvarig", {
    x: contentX + 55,
    y: 82,
    size: 11,
    font,
    color: darkGray,
  });

  page.drawText("Hylliebadet", {
    x: contentX + 55,
    y: 64,
    size: 11,
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
