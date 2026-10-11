import { describe, it, expect } from 'vitest';
import { generateInvoicePdf, InvoicePdfData } from '../invoice-pdf.service';

describe('Invoice PDF Service', () => {
  const sampleData: InvoicePdfData = {
    bookingCode: 'SGH-20261011-TEST',
    propertyName: 'Villa Nuansa Dago',
    roomName: 'Deluxe Suite',
    checkInDate: '2026-10-15',
    checkOutDate: '2026-10-17',
    totalGuests: 2,
    totalPrice: 1500000,
    guestName: 'Budi Santoso',
    guestEmail: 'budi@example.com',
    paymentMethod: 'Midtrans (qris)',
    paidAt: '2026-10-11',
  };

  it('generates a valid PDF buffer with PDF signature header', async () => {
    const buffer = await generateInvoicePdf(sampleData);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
    // PDF magic bytes: %PDF (hex 25 50 44 46)
    const header = buffer.subarray(0, 4).toString('ascii');
    expect(header).toBe('%PDF');
  });

  it('generates PDF buffer when optional fields are omitted', async () => {
    const minimalData: InvoicePdfData = {
      bookingCode: 'SGH-MINIMAL',
      propertyName: 'Hotel Horizon',
      roomName: 'Standard Room',
      checkInDate: '2026-11-01',
      checkOutDate: '2026-11-02',
      totalGuests: 1,
      totalPrice: 450000,
    };
    const buffer = await generateInvoicePdf(minimalData);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 4).toString('ascii')).toBe('%PDF');
  });
});
