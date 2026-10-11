import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export interface InvoicePdfData {
  bookingCode: string;
  propertyName: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalPrice: number;
  guestName?: string;
  guestEmail?: string;
  paymentMethod?: string;
  paidAt?: string;
}

function resolveLogoPath(): string | null {
  const p = path.resolve(__dirname, '../../assets/logo.png');
  return fs.existsSync(p) ? p : null;
}

function drawInvoiceHeader(doc: PDFKit.PDFDocument, data: InvoicePdfData) {
  const logo = resolveLogoPath();
  if (logo) doc.image(logo, 40, 40, { width: 130 });
  else doc.fontSize(20).fillColor('#0284c7').text('SinggahIn', 40, 45);

  doc.fontSize(16).fillColor('#0f172a').text('INVOICE', 300, 40, { align: 'right' });
  doc.fontSize(9).fillColor('#64748b').text(`No: INV-${data.bookingCode}`, 300, 60, { align: 'right' });
  const dateStr = data.paidAt || new Date().toISOString().split('T')[0];
  doc.text(`Tanggal: ${dateStr}`, 300, 73, { align: 'right' });
  doc.roundedRect(475, 88, 80, 18, 4).fillAndStroke('#ecfdf5', '#10b981');
  doc.fontSize(8).fillColor('#065f46').text('LUNAS / PAID', 475, 93, { width: 80, align: 'center' });
}

function drawCustomerSection(doc: PDFKit.PDFDocument, data: InvoicePdfData) {
  doc.rect(40, 125, 515, 65).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fontSize(9).fillColor('#0284c7').text('DITUJUKAN KEPADA:', 50, 133);
  doc.fontSize(10).fillColor('#0f172a').text(data.guestName || 'Tamu SinggahIn', 50, 146);
  doc.fontSize(8).fillColor('#64748b').text(data.guestEmail || '-', 50, 160);
  doc.text(`${data.totalGuests} Tamu Dewasa/Anak`, 50, 172);

  doc.fontSize(9).fillColor('#0284c7').text('RINCIAN AKOMODASI:', 300, 133);
  doc.fontSize(10).fillColor('#0f172a').text(data.propertyName, 300, 146);
  doc.fontSize(8).fillColor('#64748b').text(`Tipe: ${data.roomName}`, 300, 160);
  doc.text(`Jadwal: ${data.checkInDate} s/d ${data.checkOutDate}`, 300, 172);
}

function drawTableHeader(doc: PDFKit.PDFDocument) {
  doc.rect(40, 205, 515, 24).fill('#0284c7');
  doc.fontSize(9).fillColor('#ffffff');
  doc.text('Deskripsi Reservasi', 50, 212);
  doc.text('Jadwal Menginap', 260, 212);
  doc.text('Total Biaya', 460, 212, { align: 'right', width: 85 });
}

function drawTableBody(doc: PDFKit.PDFDocument, data: InvoicePdfData) {
  doc.rect(40, 229, 515, 45).fillAndStroke('#ffffff', '#e2e8f0');
  doc.fontSize(9).fillColor('#1e293b');
  doc.text(`${data.propertyName} (${data.roomName})`, 50, 238, { width: 200 });
  doc.fontSize(8).fillColor('#64748b').text(`${data.totalGuests} Tamu`, 50, 252);
  doc.fontSize(9).fillColor('#334155').text(`${data.checkInDate} - ${data.checkOutDate}`, 260, 242);
  const rp = `Rp ${data.totalPrice.toLocaleString('id-ID')}`;
  doc.fontSize(10).fillColor('#0f172a').text(rp, 460, 242, { align: 'right', width: 85 });
}

function drawSummary(doc: PDFKit.PDFDocument, data: InvoicePdfData) {
  doc.rect(40, 285, 515, 42).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fontSize(9).fillColor('#64748b').text('Metode Pembayaran:', 50, 294);
  doc.fontSize(9).fillColor('#0f172a').text(data.paymentMethod || 'Online Payment', 160, 294);
  doc.fontSize(9).fillColor('#64748b').text('Status Transaksi:', 50, 308);
  doc.fontSize(9).fillColor('#10b981').text('Berhasil & Dikonfirmasi', 160, 308);

  doc.fontSize(9).fillColor('#64748b').text('Total Pembayaran:', 350, 294);
  const rp = `Rp ${data.totalPrice.toLocaleString('id-ID')}`;
  doc.fontSize(13).fillColor('#0284c7').text(rp, 350, 306, { align: 'right', width: 195 });
}

function drawCheckInNotes(doc: PDFKit.PDFDocument) {
  doc.rect(40, 340, 515, 55).fillAndStroke('#fffbeb', '#fde68a');
  doc.fontSize(9).fillColor('#92400e').text('PANDUAN CHECK-IN PENTING:', 50, 348);
  doc.fontSize(8).fillColor('#78350f');
  doc.text('• Waktu standar Check-In pukul 14:00 WIB dan Check-Out pukul 12:00 WIB.', 50, 362);
  doc.text('• Harap tunjukkan kartu identitas (KTP/Paspor) serta invoice ini saat tiba di lokasi.', 50, 374);
}

function drawFooter(doc: PDFKit.PDFDocument) {
  doc.strokeColor('#e2e8f0').moveTo(40, 780).lineTo(555, 780).stroke();
  doc.fontSize(8).fillColor('#94a3b8');
  doc.text('SinggahIn Platform Sewa Properti & Villa di Indonesia', 40, 790);
  doc.text('Dokumen ini sah dan diterbitkan secara elektronik.', 300, 790, { align: 'right' });
}

function renderInvoiceSections(doc: PDFKit.PDFDocument, data: InvoicePdfData) {
  drawInvoiceHeader(doc, data);
  drawCustomerSection(doc, data);
  drawTableHeader(doc);
  drawTableBody(doc, data);
  drawSummary(doc, data);
  drawCheckInNotes(doc);
  drawFooter(doc);
}

export function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    renderInvoiceSections(doc, data);
    doc.end();
  });
}
