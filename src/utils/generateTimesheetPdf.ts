// src/utils/generateTimesheetPdf.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface PdfTimesheetEntry {
  workDate: string; // "YYYY-MM-DD"
  project: string;
  workType: string;
  clockIn: string | null; // ISO string
  clockOut: string | null; // ISO string
  hours: number;
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return { dayLabel: "", dateLabel: "" };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayLabel = days[d.getDay()];
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();

  return { dayLabel, dateLabel: `${month}/${day}/${year}` };
}

function formatTimeLabel(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function generateTimesheetPdf(options: {
  templateUrl: string;
  employeeName: string;
  weekStart: Date;
  weekEnd: Date;
  entries: PdfTimesheetEntry[];
}) {
  const { templateUrl, employeeName, weekStart, weekEnd, entries } = options;

  // 1) Load template
  const templateBytes = await fetch(templateUrl).then((res) =>
    res.arrayBuffer()
  );
  const pdfDoc = await PDFDocument.load(templateBytes);
  const [page] = pdfDoc.getPages();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 2) Week label
  const weekStartLabel = `${weekStart.getMonth() + 1}/${String(
    weekStart.getDate()
  ).padStart(2, "0")}/${weekStart.getFullYear()}`;
  const weekEndLabel = `${weekEnd.getMonth() + 1}/${String(
    weekEnd.getDate()
  ).padStart(2, "0")}/${weekEnd.getFullYear()}`;
  const weekRangeText = `${weekStartLabel} - ${weekEndLabel}`;

  // 3) Total hours
  const totalHours = entries.reduce((acc, e) => acc + (e.hours || 0), 0);

  // ===== COORDINATES (using your grid values) =====
  // All coordinates are absolute, origin (0,0) at bottom-left.

  // Header: Name & Week Ending range
  page.drawText(employeeName, {
    x: 80,         // Name
    y: 650,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  page.drawText(weekRangeText, {
    x: 320,        // Week ending range
    y: 650,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  // Total hours box at bottom ("Total Hours Worked")
  page.drawText(totalHours.toFixed(2), {
    x: 240,
    y: 215,
    size: 10,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  // 4) Table rows
  // First data row at y = 625, each row 14 pts down
  let currentY = 625;
  const rowHeight = 12;

  // Columns (from your measurements)
  const colDayX = 20;
  const colDateX = 60;
  const colTimeInX = 120;
  const colTimeOutX = 180;
  const colHoursX = 240;
  const colProjectX = 320;
  const colTypeX = 520;

  const maxRows = 30;

  entries.slice(0, maxRows).forEach((entry) => {
    const { dayLabel, dateLabel } = formatDateLabel(entry.workDate);

    page.drawText(dayLabel, {
      x: colDayX,
      y: currentY,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    });

    page.drawText(dateLabel, {
      x: colDateX,
      y: currentY,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    });

    page.drawText(formatTimeLabel(entry.clockIn), {
      x: colTimeInX,
      y: currentY,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    });

    page.drawText(formatTimeLabel(entry.clockOut), {
      x: colTimeOutX,
      y: currentY,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    });

    page.drawText((entry.hours || 0).toFixed(2), {
      x: colHoursX,
      y: currentY,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    });

    if (entry.project) {
      page.drawText(entry.project, {
        x: colProjectX,
        y: currentY,
        size: 9,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
    }

    if (entry.workType) {
      page.drawText(entry.workType, {
        x: colTypeX,
        y: currentY,
        size: 9,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
    }

    currentY -= rowHeight;
  });

  // 5) Employee signature autofill (manager signature left blank)
  page.drawText(employeeName, {
    x: 220,  // Employee signature line
    y: 160,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  // 6) Export to browser & trigger download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `GCSS-Timesheet-${weekEndLabel.replace(
    /\//g,
    "-"
  )}-${employeeName.replace(/\s+/g, "_")}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
