// src/pdf/serviceTicketPdf.ts
import { PDFDocument, rgb, type PDFPage } from "pdf-lib";
import type { NewServiceTicketPayload } from "../types";

// Your coords were measured on the grid image:
// - origin at TOP-LEFT
// - units in pixels
// The rendered image was at 2 px per PDF point.
// pdf-lib uses BOTTOM-LEFT origin in points.
// So we convert:
//
//  x_pt = x_px / 2
//  y_pt = pageHeight - (y_px / 2)
//
const SCALE = 2; // 2 pixels per PDF point

type TL = { x: number; y: number };

const coordsTL = {
  customerName: { x: 230, y: 345 } as TL,

  address: { x: 160, y: 370 } as TL,
  city: { x: 550, y: 370 } as TL,
  state: { x: 745, y: 370 } as TL,
  zip: { x: 845, y: 370 } as TL,

  billingEmail: { x: 280, y: 395 } as TL,
  billingAddress: { x: 160, y: 455 } as TL,
  billingCity: { x: 550, y: 455 } as TL,
  billingState: { x: 740, y: 455 } as TL,
  billingZip: { x: 840, y: 455 } as TL,

  technician: { x: 190, y: 505 } as TL,

  // Service Work Performed text box
  serviceWork: { x: 100, y: 600 } as TL,
};

// Box for Service Work Performed in *pixel* coords
const serviceWorkBox = {
  topLeft: { x: 100, y: 600 },
  widthPx: 1080 - 100, // 945 px
  heightPx: 220,       // from y:900 to y:1000
};

const materialRowsTL: {
  qty: TL;
  description: TL;
  cost: TL;
  total: TL;
}[] = [
  {
    qty: { x: 100, y: 900 },
    description: { x: 170, y: 900 },
    cost: { x: 880, y: 900 },
    total: { x: 1040, y: 900 },
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
    qty: { x: 100, y: 1045 },
    description: { x: 170, y: 1045 },
    cost: { x: 880, y: 1045 },
    total: { x: 1040, y: 1045 },
  },
];

const laborRowsTL: {
  techDate: TL;
  rateHr: TL;
  timeIn: TL;
  timeOut: TL;
  totalHours: TL;
  totalLabor: TL;
}[] = [
  {
    techDate: { x: 90, y: 1170 },
    rateHr: { x: 290, y: 1170 },
    timeIn: { x: 410, y: 1170 },
    timeOut: { x: 590, y: 1170 },
    totalHours: { x: 870, y: 1170 },
    totalLabor: { x: 1020, y: 1170 },
  },
  {
    techDate: { x: 90, y: 1200 },
    rateHr: { x: 300, y: 1200 },
    timeIn: { x: 410, y: 1200 },
    timeOut: { x: 590, y: 1200 },
    totalHours: { x: 870, y: 1200 },
    totalLabor: { x: 1020, y: 1200 },
  },
  {
    techDate: { x: 90, y: 1225 },
    rateHr: { x: 300, y: 1225 },
    timeIn: { x: 410, y: 1225 },
    timeOut: { x: 590, y: 1225 },
    totalHours: { x: 870, y: 1225 },
    totalLabor: { x: 1020, y: 1225 },
  },
  {
    techDate: { x: 90, y: 1255 },
    rateHr: { x: 300, y: 1255 },
    timeIn: { x: 410, y: 1255 },
    timeOut: { x: 590, y: 1255 },
    totalHours: { x: 870, y: 1255 },
    totalLabor: { x: 1020, y: 1255 },
  },
];

const totalsTL = {
  materialTotal: { x: 1020, y: 1070 } as TL,       // NEW: material total box
  laborTotalHours: { x: 880, y: 1285 } as TL,
  laborTotalLabor: { x: 1030, y: 1285 } as TL,
  grandTotal: { x: 1030, y: 1315 } as TL,
};

const signatureTL = {
  customerSignature: { x: 290, y: 1420 } as TL, // image later
  namePrinted: { x: 290, y: 1450 } as TL,
  date: { x: 1000, y: 1420 } as TL,
};

function fromTopLeftToPdf(tl: TL, pageHeight: number) {
  return {
    x: tl.x / SCALE,
    y: pageHeight - tl.y / SCALE,
  };
}

function drawText(
  page: PDFPage,
  text: string | number | null | undefined,
  tl: TL,
  pageHeight: number,
  size = 10
) {
  const value =
    text === null || text === undefined
      ? ""
      : typeof text === "number"
      ? text.toString()
      : text;

  const { x, y } = fromTopLeftToPdf(tl, pageHeight);
  page.drawText(value, {
    x,
    y,
    size,
    color: rgb(0, 0, 0),
  });
}

// ---------- Formatting helpers ----------
function formatCurrency(amount: number | null | undefined): string {
  const n = Number(amount ?? 0);
  return `$${n.toFixed(2)}`;
}

// Convert "HH:MM" (24h) to "H:MM AM/PM"
function formatTime12h(time: string | null | undefined): string {
  if (!time) return "";
  const [hhStr, mmStr] = time.split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return time;

  const suffix = hh >= 12 ? "PM" : "AM";
  const hour12 = ((hh + 11) % 12) + 1; // 0->12, 13->1, etc.
  return `${hour12}:${mmStr.padStart(2, "0")} ${suffix}`;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const parts = dataUrl.split(",");
  const base64 = parts[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Very dumb text wrapper, but good enough for a fixed-width box.
// Works in *pixel* coordinates, converts to PDF points.
function drawWrappedTextInBox(
  page: PDFPage,
  text: string,
  tlPx: TL,
  boxWidthPx: number,
  boxHeightPx: number,
  pageHeight: number,
  fontSize = 9
) {
  if (!text.trim()) return;

  const boxWidthPt = boxWidthPx / SCALE;
  const boxHeightPt = boxHeightPx / SCALE;
  const lineHeight = fontSize * 1.2;

  const maxLines = Math.max(1, Math.floor(boxHeightPt / lineHeight));

  // Very rough character width estimate
  const maxCharsPerLine = Math.max(
    5,
    Math.floor(boxWidthPt / (fontSize * 0.5))
  );

  const words = text.replace(/\r\n/g, "\n").split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test =
      current.length === 0 ? word : current + " " + word;
    if (test.length > maxCharsPerLine) {
      if (current.length > 0) {
        lines.push(current);
        current = word;
      } else {
        // word itself longer than line, hard-split
        lines.push(test.slice(0, maxCharsPerLine));
        current = test.slice(maxCharsPerLine);
      }
    } else {
      current = test;
    }
  }
  if (current.length > 0) {
    lines.push(current);
  }

  // Clip to maxLines, add "…" if we had to cut
  let clipped = false;
  if (lines.length > maxLines) {
    clipped = true;
  }
  const finalLines = lines.slice(0, maxLines);
  if (clipped) {
    const last = finalLines[finalLines.length - 1];
    finalLines[finalLines.length - 1] =
      last.length > 3 ? last.slice(0, last.length - 3) + "..." : last + "...";
  }

  const start = fromTopLeftToPdf(tlPx, pageHeight);
  let y = start.y;

  for (let i = 0; i < finalLines.length; i++) {
    const line = finalLines[i];
    page.drawText(line, {
      x: start.x,
      y,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  }
}

export async function generateServiceTicketPdfFromPayload(
  payload: NewServiceTicketPayload
): Promise<Uint8Array> {
  // IMPORTANT:
  // gcss-service-form.pdf must be in your Vite/React `public/` folder:
  //   /public/gcss-service-form.pdf
  // In build (GitHub Pages under /inventory-pwa/), we need a RELATIVE URL.
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

  // ----------------------
  // Header / Customer info
  // ----------------------
  drawText(page, payload.customer_name, coordsTL.customerName, pageHeight);

  drawText(page, payload.address, coordsTL.address, pageHeight);
  drawText(page, payload.city, coordsTL.city, pageHeight);
  drawText(page, payload.state, coordsTL.state, pageHeight);
  drawText(page, payload.zip, coordsTL.zip, pageHeight);

  drawText(page, payload.billing_email, coordsTL.billingEmail, pageHeight);
  drawText(page, payload.billing_address, coordsTL.billingAddress, pageHeight);
  drawText(page, payload.billing_city, coordsTL.billingCity, pageHeight);
  drawText(page, payload.billing_state, coordsTL.billingState, pageHeight);
  drawText(page, payload.billing_zip, coordsTL.billingZip, pageHeight);

  drawText(page, payload.technician, coordsTL.technician, pageHeight);

  // ----------------------
  // Service Work Performed
  // ----------------------
  if (payload.service_work) {
    drawWrappedTextInBox(
      page,
      payload.service_work,
      serviceWorkBox.topLeft,
      serviceWorkBox.widthPx,
      serviceWorkBox.heightPx,
      pageHeight,
      9 // font size
    );
  }

  // -------------
  // Materials rows
  // -------------
  const maxMaterials = Math.min(
    payload.materials.length,
    materialRowsTL.length
  );

  for (let i = 0; i < maxMaterials; i++) {
    const row = payload.materials[i];
    const c = materialRowsTL[i];

    drawText(page, row.qty, c.qty, pageHeight);
    drawText(page, row.description, c.description, pageHeight);
    drawText(page, formatCurrency(row.cost), c.cost, pageHeight);
    drawText(page, formatCurrency(row.total), c.total, pageHeight);
  }

  // -------------
  // Labor rows
  // -------------
  const maxLabor = Math.min(payload.labor.length, laborRowsTL.length);

  for (let i = 0; i < maxLabor; i++) {
    const row = payload.labor[i];
    const c = laborRowsTL[i];

    const techDateLabel = `${row.tech_initials} ${row.date}`.trim();

    drawText(page, techDateLabel, c.techDate, pageHeight);
    drawText(
      page,
      `${formatCurrency(row.rate)}/hr`,
      c.rateHr,
      pageHeight
    );
    drawText(page, formatTime12h(row.time_in), c.timeIn, pageHeight);
    drawText(page, formatTime12h(row.time_out), c.timeOut, pageHeight);
    drawText(page, row.total_hours.toFixed(2), c.totalHours, pageHeight);
    drawText(page, formatCurrency(row.total_labor), c.totalLabor, pageHeight);
  }

  // -------------
  // Totals
  // -------------
  const materialTotal =
    payload.material_total ??
    payload.materials.reduce((sum, m) => sum + (m.total || 0), 0);

  const totalLaborHours = payload.labor.reduce(
    (sum, l) => sum + (l.total_hours || 0),
    0
  );
  const totalLaborCost = payload.labor.reduce(
    (sum, l) => sum + (l.total_labor || 0),
    0
  );

  const grandTotal =
    payload.grand_total ??
    ((payload.material_total || 0) + (payload.labor_total || 0));

  // NEW: draw material total into its box
  drawText(
    page,
    formatCurrency(materialTotal),
    totalsTL.materialTotal,
    pageHeight
  );

  drawText(
    page,
    totalLaborHours.toFixed(2),
    totalsTL.laborTotalHours,
    pageHeight
  );
  drawText(
    page,
    formatCurrency(totalLaborCost),
    totalsTL.laborTotalLabor,
    pageHeight
  );
  drawText(page, formatCurrency(grandTotal), totalsTL.grandTotal, pageHeight);

  // -------------
  // Signature block
  // -------------
  drawText(
    page,
    payload.signature_name,
    signatureTL.namePrinted,
    pageHeight
  );
  drawText(page, payload.signature_date, signatureTL.date, pageHeight);

  // Signature image (data URL) if present
  if (payload.signature) {
    try {
      const pngBytes = dataUrlToUint8Array(payload.signature);
      const pngImage = await pdfDoc.embedPng(pngBytes);

      const targetWidth = 200; // points, tweak if you want
      const scale = targetWidth / pngImage.width;
      const targetHeight = pngImage.height * scale;

      const anchor = fromTopLeftToPdf(
        signatureTL.customerSignature,
        pageHeight
      );

      page.drawImage(pngImage, {
        x: anchor.x,
        y: anchor.y - targetHeight * 0.3, // nudge so it sits nicely
        width: targetWidth,
        height: targetHeight,
      });
    } catch (err) {
      console.error("Error embedding signature image:", err);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
