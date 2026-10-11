"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPropertyReviews = seedPropertyReviews;
const client_1 = require("@prisma/client");
const REVIEW_COMMENTS = [
    'Tempatnya sangat nyaman, bersih dan pelayanan ramah. Dekat dengan pusat kuliner dan wisata.',
    'Pemandangan dari kamar luar biasa indah, suasana tenang dan asri. Sangat cocok untuk liburan keluarga.',
    'Fasilitas lengkap sesuai deskripsi, WiFi kencang untuk kerja, dan kamar mandi bersih.',
    'Staff sangat ramah dan cekatan. Kamar luas dengan kasur yang empuk. Pengalaman menginap yang menyenangkan!',
    'Lokasi sangat strategis, akses mudah ke mana-mana. Nilai yang sepadan dengan fasilitas yang didapat.',
    'Suka sekali dengan suasananya, estetik dan bikin betah. Pasti akan pesan lagi saat berkunjung ke sini.',
    'Penginapan yang tenang dan bersih. Suasana malam sangat damai, cocok untuk istirahat setelah keliling kota.',
    'Proses check-in cepat tanpa ribet, kamar rapi dan wangi. Sangat direkomendasikan untuk staycation!'
];
function buildPastDates(offsetDays) {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() - (offsetDays + 2));
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() - offsetDays);
    return { checkIn, checkOut };
}
function buildBookingData(prop, userId, code, offset) {
    const room = prop.rooms[0];
    const { checkIn, checkOut } = buildPastDates(offset);
    const totalPrice = room.basePrice * 2;
    return {
        bookingCode: code, userId, propertyId: prop.id, roomId: room.id,
        checkInDate: checkIn, checkOutDate: checkOut, totalNights: 2, guestCount: 2,
        totalPrice, status: client_1.BookingStatus.COMPLETED, expiresAt: checkIn,
        paymentAmount: totalPrice, paidAt: checkIn
    };
}
async function createCompletedBooking(prisma, prop, userId, code, offset) {
    const d = buildBookingData(prop, userId, code, offset);
    return prisma.booking.upsert({
        where: { bookingCode: code }, update: {},
        create: {
            bookingCode: d.bookingCode, userId: d.userId, propertyId: d.propertyId,
            roomId: d.roomId, checkInDate: d.checkInDate, checkOutDate: d.checkOutDate,
            totalNights: d.totalNights, guestCount: d.guestCount, totalPrice: d.totalPrice,
            status: d.status, expiresAt: d.expiresAt,
            payment: {
                create: {
                    paymentMethod: client_1.PaymentMethod.PAYMENT_GATEWAY, amount: d.paymentAmount,
                    status: client_1.PaymentStatus.SETTLEMENT, paidAt: d.paidAt, confirmedAt: d.paidAt
                }
            }
        }
    });
}
async function upsertReview(prisma, bookingId, userId, propertyId, rating, comment) {
    await prisma.review.upsert({
        where: { bookingId }, update: { rating, comment },
        create: { bookingId, userId, propertyId, rating, comment }
    });
}
async function seedSingleReview(prisma, prop, userId, code, rating, comment, offset) {
    const b = await createCompletedBooking(prisma, prop, userId, code, offset);
    await upsertReview(prisma, b.id, userId, prop.id, rating, comment);
}
async function seedPropertyReviews(prisma, properties, userIds) {
    for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];
        const c1 = REVIEW_COMMENTS[(i * 2) % REVIEW_COMMENTS.length];
        await seedSingleReview(prisma, prop, userIds[0], `BK-SEED-${i + 1}-A`, 5, c1, 10 + (i % 5));
        if (i % 2 === 0 && userIds[1]) {
            const c2 = REVIEW_COMMENTS[(i * 2 + 1) % REVIEW_COMMENTS.length];
            const r2 = i % 4 === 0 ? 5 : 4;
            await seedSingleReview(prisma, prop, userIds[1], `BK-SEED-${i + 1}-B`, r2, c2, 20 + (i % 5));
        }
    }
}
