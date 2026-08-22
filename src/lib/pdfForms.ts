import { jsPDF } from "jspdf";
import { format } from "date-fns";

const PAGE_WIDTH = 297; // A4 landscape, mm
const PAGE_HEIGHT = 210;
const MARGIN = 12;

function newLandscapeDoc() {
  return new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
}

function centeredText(doc: jsPDF, text: string, y: number) {
  doc.text(text, PAGE_WIDTH / 2, y, { align: "center" });
}

export interface Form1ARow {
  regimentalNumber: string;
  rank: string;
  name: string;
  vehicleNumber: string;
  makeOfVehicle: string;
  formation: string;
  natureOfDetail: string;
  oil: string;
  diesel: string;
}

export interface Form1AOptions {
  sheet: string;
  date: string;
  rows: Form1ARow[];
}

/**
 * Generates TTDF Form 1A (Revised) — Gasoline, Oil and Lubricants Issue Voucher
 * (Military Vehicles), matching the official paper form layout.
 */
export function generateForm1A({ sheet, date, rows }: Form1AOptions): jsPDF {
  const doc = newLandscapeDoc();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("FORM 1A (Revised)", PAGE_WIDTH - MARGIN, MARGIN, { align: "right" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  centeredText(doc, "TRINIDAD AND TOBAGO DEFENCE FORCE", MARGIN + 4);
  doc.setFontSize(12);
  centeredText(doc, "GASOLINE, OIL AND LUBRICANTS ISSUE VOUCHER", MARGIN + 11);
  doc.setFont("helvetica", "italic");
  centeredText(doc, "MILITARY VEHICLES", MARGIN + 17);

  const columns = [
    { label: "REGIMENTAL\nNUMBER", key: "regimentalNumber", width: 24 },
    { label: "RANK", key: "rank", width: 20 },
    { label: "NAME", key: "name", width: 40 },
    { label: "VEHICLE\nNUMBER", key: "vehicleNumber", width: 22 },
    { label: "MAKE OF\nVEHICLE", key: "makeOfVehicle", width: 26 },
    { label: "FORMATION/COY/\nORGANISATION", key: "formation", width: 32 },
    { label: "NATURE OF\nDETAIL", key: "natureOfDetail", width: 32 },
    { label: "OIL", key: "oil", width: 16 },
    { label: "DIESEL", key: "diesel", width: 18 },
    { label: "SIGNATURE", key: "signature", width: 24 },
  ];
  const tableWidth = columns.reduce((sum, c) => sum + c.width, 0);
  const tableX = (PAGE_WIDTH - tableWidth) / 2;
  const tableTop = MARGIN + 24;
  const headerHeight = 12;
  const rowHeight = 8;
  const maxRowsPerPage = Math.floor((PAGE_HEIGHT - tableTop - 22) / rowHeight);

  const drawHeader = (y: number) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    let x = tableX;
    doc.rect(tableX, y, tableWidth, headerHeight);
    for (const col of columns) {
      doc.rect(x, y, col.width, headerHeight);
      const lines = col.label.split("\n");
      lines.forEach((line, i) => {
        doc.text(line, x + col.width / 2, y + headerHeight / 2 - (lines.length - 1) * 1.8 + i * 3.6 + 1, {
          align: "center",
        });
      });
      x += col.width;
    }
  };

  let y = tableTop;
  drawHeader(y);
  y += headerHeight;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  rows.forEach((row, idx) => {
    if (idx > 0 && idx % maxRowsPerPage === 0) {
      doc.addPage();
      y = MARGIN;
      drawHeader(y);
      y += headerHeight;
    }
    let x = tableX;
    for (const col of columns) {
      doc.rect(x, y, col.width, rowHeight);
      if (col.key !== "signature") {
        const value = (row as any)[col.key] ?? "";
        doc.text(String(value), x + 1.5, y + rowHeight / 2 + 1, { maxWidth: col.width - 3 });
      }
      x += col.width;
    }
    y += rowHeight;
  });

  // Pad remaining rows on the last page to match the blank paper form
  const remainder = rows.length % maxRowsPerPage;
  const blankRows = remainder === 0 ? 0 : maxRowsPerPage - remainder;
  for (let i = 0; i < Math.min(blankRows, 6); i++) {
    let x = tableX;
    for (const col of columns) {
      doc.rect(x, y, col.width, rowHeight);
      x += col.width;
    }
    y += rowHeight;
  }

  y += 10;
  doc.setFontSize(9);
  doc.text(`SHEET: ${sheet}`, tableX, y);
  doc.text(`DATE: ${date}`, tableX + tableWidth / 2 - 15, y);
  doc.text("P.O.L ATTENDANT SIGNATURE: _______________________", tableX + tableWidth - 80, y);

  return doc;
}

export interface RoutingSlipOptions {
  to: string;
  from: string;
  date: string;
  subject: string;
  action:
    | "For your information"
    | "For follow up action"
    | "Immediate Feedback"
    | "For Comments"
    | "For Action"
    | "Note and Return"
    | "For Discussion"
    | "Noted-File"
    | "BU on File";
  comments?: string;
}

const ROUTING_SLIP_ACTIONS: RoutingSlipOptions["action"][] = [
  "For your information",
  "For follow up action",
  "Immediate Feedback",
  "For Comments",
  "For Action",
  "Note and Return",
  "For Discussion",
  "Noted-File",
  "BU on File",
];

/**
 * Generates a Routing Slip matching the standard cover-sheet template used to
 * direct a report or letter to the appropriate office per standing orders.
 */
export function generateRoutingSlip(options: RoutingSlipOptions): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const width = 210;
  const margin = 20;
  let y = 25;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Routing Slip", margin, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const field = (label: string, value: string) => {
    doc.text(`${label}:`, margin, y);
    doc.line(margin + 22, y + 1, width - margin, y + 1);
    doc.text(value, margin + 24, y);
    y += 10;
  };

  field("To", options.to);
  field("From", options.from);
  field("Date", options.date);

  doc.text("Subject:", margin, y);
  y += 6;
  const subjectLines = doc.splitTextToSize(options.subject, width - margin * 2);
  doc.text(subjectLines, margin, y);
  y += subjectLines.length * 6 + 8;

  y += 4;
  for (const action of ROUTING_SLIP_ACTIONS) {
    const checked = action === options.action;
    doc.rect(margin, y - 4, 4, 4);
    if (checked) {
      doc.setFont("helvetica", "bold");
      doc.text("X", margin + 0.6, y - 0.8);
      doc.setFont("helvetica", "normal");
    }
    doc.text(action, margin + 8, y);
    y += 7;
  }

  y += 6;
  doc.text("Comments:", margin, y);
  y += 6;
  const boxTop = y;
  doc.rect(margin, boxTop, width - margin * 2, 40);
  if (options.comments) {
    const commentLines = doc.splitTextToSize(options.comments, width - margin * 2 - 6);
    doc.text(commentLines, margin + 3, boxTop + 6);
  }

  return doc;
}

export function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

export function todayFormatted(): string {
  return format(new Date(), "dd MMM yyyy");
}
