// src/pdf/serviceTicketPdf.ts
import { PDFDocument, rgb, type PDFPage } from "pdf-lib";
import type { NewServiceTicketPayload } from "../types";

// Coordinates & helpers

const SCALE = 2; // 2 pixels per PDF point

type TL = { x: number; y: number };

const coordsTL = {
  customerName: { x: 230, y: 345 } as TL,
  address: { x: 180, y: 375 } as TL,
  city: { x: 140, y: 403 } as TL,
  state: { x: 387, y: 403 } as TL,
  zip: { x: 498, y: 403 } as TL,

  billingEmail: { x: 780, y: 280 } as TL,
  billingAddress: { x: 780, y: 315 } as TL,

  phone: { x: 105, y: 430 } as TL,
  email: { x: 360, y: 430 } as TL,

  technician: { x: 160, y: 455 } as TL,
  ticketNumber: { x: 620, y: 345 } as TL,
  date: { x: 900, y: 345 } as TL,

  // Problems
  problem1: { x: 90, y: 510 } as TL,
  problem2: { x: 90, y: 532 } as TL,
  problem3: { x: 90, y: 555 } as TL,
  problem4: { x: 90, y: 578 } as TL,
  problem5: { x: 90, y: 600 } as TL,

  // Notes
  notes1: { x: 90, y: 650 } as TL,
  notes2: { x: 90, y: 670 } as TL,
  notes3: { x: 90, y: 690 } as TL,
  notes4: { x: 90, y: 710 } as TL,
  notes5: { x: 90, y: 730 } as TL,
  notes6: { x: 90, y: 750 } as TL,
  notes7: { x: 90, y: 770 } as TL,

  // Recommendations
  rec1: { x: 90, y: 830 } as TL,
  rec2: { x: 90, y: 850 } as TL,
  rec3: { x: 90, y: 870 } as TL,
  rec4: { x: 90, y: 890 } as TL,
  rec5: { x: 90, y: 910 } as TL,

  // Line items: 7 rows
  lineItems: [
    {
      qty: { x: 100, y: 910 },
      description: { x: 170, y: 910 },
      cost: { x: 880, y: 910 },
      total: { x: 1040, y: 910 },
    },
    {
      qty: { x: 100, y: 935 },
      description: { x: 170, y: 935 },
      cost: { x: 880, y: 935 },
      total: { x: 1040, y: 935 },
    },
    {
      qty: { x: 100, y: 960 },
      description: { x: 170, y: 960 },
      cost: { x: 880, y: 960 },
      total: { x: 1040, y: 960 },
    },
    {
      qty: { x: 100, y: 985 },
      description: { x: 170, y: 985 },
      cost: { x: 880, y: 985 },
      total: { x: 1040, y: 985 },
    },
    {
      qty: { x: 100, y: 1015 },
      description: { x: 170, y: 1015 },
      cost: { x: 880, y: 1015 },
      total: { x: 1040, y: 1015 },
    },
    {
      qty: { x: 100, y: 1040 },
      description: { x: 170, y: 1040 },
      cost: { x: 880, y: 1040 },
      total: { x: 1040, y: 1040 },
    },
    {
      qty: { x: 100, y: 1065 },
      description: { x: 170, y: 1065 },
      cost: { x: 880, y: 1065 },
      total: { x: 1040, y: 1065 },
    },
  ] as {
    qty: TL;
    description: TL;
    cost: TL;
    total: TL;
  }[],

  subTotal: { x: 1040, y: 1096 } as TL,
  tax: { x: 1040, y: 1120 } as TL,
  totalAmount: { x: 1040, y: 1145 } as TL,

  // Signature + date
  signature: { x: 170, y: 1170 } as TL,
  signatureDate: { x: 650, y: 1170 } as TL,

  // Work dates
  workStart: { x: 330, y: 1185 } as TL,
  workEnd: { x: 330, y: 1210 } as TL,

  // Time in/out
  timeIn: { x: 160, y: 1238 } as TL,
  timeOut: { x: 160, y: 1260 } as TL,
  totalHours: { x: 420, y: 1250 } as TL,
} as const;

function toPdfPointX(xPx: number): number {
  return xPx / SCALE;
}

function toPdfPointY(yPx: number, pageHeight: number): number {
  return pageHeight - yPx / SCALE;
}

function drawText(
  page: PDFPage,
  text: string | null | undefined,
  tl: TL,
  pageHeight: number,
  options?: {
    size?: number;
    maxWidth?: number;
    align?: "left" | "center" | "right";
  }
) {
  const value = (text ?? "").toString().trim();
  if (!value) return;

  const size = options?.size ?? 10;
  const maxWidth = options?.maxWidth ?? 0;
  const align = options?.align ?? "left";

  const x = toPdfPointX(tl.x);
  const y = toPdfPointY(tl.y, pageHeight);

  if (!maxWidth || value.length < maxWidth / (size * 0.6)) {
    let drawX = x;
    if (align === "center") {
      drawX = x - (value.length * size * 0.3) / 2;
    } else if (align === "right") {
      drawX = x - value.length * size * 0.6;
    }

    page.drawText(value, {
      x: drawX,
      y,
      size,
      color: rgb(0, 0, 0),
    });
    return;
  }

  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  const approxCharsPerLine = Math.floor(maxWidth / (size * 0.6));
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > approxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  const lineHeight = size * 1.2;
  lines.forEach((line, index) => {
    let lineX = x;
    if (align === "center") {
      lineX = x - (line.length * size * 0.3) / 2;
    } else if (align === "right") {
      lineX = x - line.length * size * 0.6;
    }

    page.drawText(line, {
      x: lineX,
      y: y - index * lineHeight,
      size,
      color: rgb(0, 0, 0),
    });
  });
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "";
  return `$${value.toFixed(2)}`;
}

function safeNumber(n: unknown): number | null {
  if (typeof n === "number" && !isNaN(n)) return n;
  if (typeof n === "string" && n.trim() !== "") {
    const parsed = Number(n);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

function drawLineItems(
  page: PDFPage,
  payload: NewServiceTicketPayload,
  pageHeight: number
) {
  const items = payload.line_items ?? [];
  const coords = coordsTL.lineItems;

  for (let i = 0; i < coords.length; i++) {
    const item = items[i];
    const row = coords[i];
    if (!item) continue;

    const qty = safeNumber(item.qty);
    const cost = safeNumber(item.cost);
    const total = safeNumber(item.total);

    if (qty != null) {
      drawText(page, qty.toString(), row.qty, pageHeight, {
        align: "center",
      });
    }

    if (item.description) {
      drawText(page, item.description, row.description, pageHeight, {
        maxWidth: 650,
      });
    }

    if (cost != null) {
      drawText(page, formatCurrency(cost), row.cost, pageHeight, {
        align: "right",
      });
    }

    if (total != null) {
      drawText(page, formatCurrency(total), row.total, pageHeight, {
        align: "right",
      });
    }
  }

  const subTotal = safeNumber(payload.subtotal);
  const tax = safeNumber(payload.tax);
  const grandTotal = safeNumber(payload.total);

  if (subTotal != null) {
    drawText(
      page,
      formatCurrency(subTotal),
      coordsTL.subTotal,
      pageHeight,
      { align: "right" }
    );
  }

  if (tax != null) {
    drawText(page, formatCurrency(tax), coordsTL.tax, pageHeight, {
      align: "right",
    });
  }

  if (grandTotal != null) {
    drawText(
      page,
      formatCurrency(grandTotal),
      coordsTL.totalAmount,
      pageHeight,
      { align: "right" }
    );
  }
}

function drawMultiLineBlock(
  page: PDFPage,
  lines: (string | null | undefined)[],
  coords: TL[],
  pageHeight: number
) {
  for (let i = 0; i < coords.length; i++) {
    const line = lines[i] ?? "";
    if (!line) continue;
    drawText(page, line, coords[i], pageHeight);
  }
}

async function embedSignatureImage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  signatureDataUrl: string,
  pageHeight: number
) {
  if (!signatureDataUrl.startsWith("data:image")) {
    return;
  }

  const base64 = signatureDataUrl.split(",")[1];
  if (!base64) return;

  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const pngImage = await pdfDoc.embedPng(bytes);

  const boxWidth = 250;
  const boxHeight = 60;

  const pngDims = pngImage.scale(1);
  const widthRatio = boxWidth / pngDims.width;
  const heightRatio = boxHeight / pngDims.height;
  const scale = Math.min(widthRatio, heightRatio);

  const targetWidth = pngDims.width * scale;
  const targetHeight = pngDims.height * scale;

  const anchor = coordsTL.signature;
  const x = toPdfPointX(anchor.x);
  const y = toPdfPointY(anchor.y, pageHeight);

  page.drawImage(pngImage, {
    x,
    y,
    width: targetWidth,
    height: targetHeight,
  });
}

// Main function
export async function generateServiceTicketPdfFromPayload(
  payload: NewServiceTicketPayload
): Promise<Uint8Array> {
  // Template must be in:
  // - dev:     public/gcss-service-form.pdf
  // - build:   docs/gcss-service-form.pdf (same folder as index.html)
  // So we use a *relative* URL:
  const formPdfUrl = "gcss-service-form.pdf";

  const response = await fetch(formPdfUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to load template PDF from ${formPdfUrl}: ${response.status} ${response.statusText}`
    );
  }
  const formPdfBytes = await response.arrayBuffer();

  const pdfDoc = await PDFDocument.load(formPdfBytes);
  const [page] = pdfDoc.getPages();
  const pageHeight = page.getHeight();

  // Header / customer info
  drawText(page, payload.customer_name, coordsTL.customerName, pageHeight);

  drawText(page, payload.address, coordsTL.address, pageHeight);
  drawText(page, payload.city, coordsTL.city, pageHeight);
  drawText(page, payload.state, coordsTL.state, pageHeight);
  drawText(page, payload.zip, coordsTL.zip, pageHeight);

  drawText(page, payload.billing_email, coordsTL.billingEmail, pageHeight);
  drawText(page, payload.billing_address, coordsTL.billingAddress, pageHeight);

  drawText(page, payload.phone, coordsTL.phone, pageHeight);
  drawText(page, payload.email, coordsTL.email, pageHeight);

  drawText(page, payload.technician, coordsTL.technician, pageHeight);
  drawText(
    page,
    payload.ticket_number?.toString() ?? "",
    coordsTL.ticketNumber,
    pageHeight
  );

  drawText(page, payload.date ?? "", coordsTL.date, pageHeight);

  // Problems
  const problems = (payload.problems ?? "").split(/\r?\n/);
  drawMultiLineBlock(
    page,
    problems,
    [
      coordsTL.problem1,
      coordsTL.problem2,
      coordsTL.problem3,
      coordsTL.problem4,
      coordsTL.problem5,
    ],
    pageHeight
  );

  // Notes
  const notes = (payload.notes ?? "").split(/\r?\n/);
  drawMultiLineBlock(
    page,
    notes,
    [
      coordsTL.notes1,
      coordsTL.notes2,
      coordsTL.notes3,
      coordsTL.notes4,
      coordsTL.notes5,
      coordsTL.notes6,
      coordsTL.notes7,
    ],
    pageHeight
  );

  // Recommendations
  const recs = (payload.recommendations ?? "").split(/\r?\n/);
  drawMultiLineBlock(
    page,
    recs,
    [
      coordsTL.rec1,
      coordsTL.rec2,
      coordsTL.rec3,
      coordsTL.rec4,
      coordsTL.rec5,
    ],
    pageHeight
  );

  // Line items + totals
  drawLineItems(page, payload, pageHeight);

  // Work dates
  drawText(page, payload.work_start ?? "", coordsTL.workStart, pageHeight);
  drawText(page, payload.work_end ?? "", coordsTL.workEnd, pageHeight);

  // Time + hours
  drawText(page, payload.time_in ?? "", coordsTL.timeIn, pageHeight);
  drawText(page, payload.time_out ?? "", coordsTL.timeOut, pageHeight);

  if (payload.total_hours != null) {
    drawText(
      page,
      payload.total_hours.toString(),
      coordsTL.totalHours,
      pageHeight
    );
  }

  // Signature date
  if (payload.signature_date) {
    drawText(
      page,
      payload.signature_date,
      coordsTL.signatureDate,
      pageHeight
    );
  }

  // Signature image
  if (payload.signature_image) {
    try {
      await embedSignatureImage(pdfDoc, page, payload.signature_image, pageHeight);
    } catch (err) {
      console.error("Error embedding signature image:", err);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
