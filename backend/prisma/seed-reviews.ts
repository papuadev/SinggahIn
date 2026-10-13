import { PrismaClient, BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface SeedPropertyRef {
  id: string;
  title: string;
  rooms: Array<{ id: string; basePrice: number }>;
}

interface ReviewPlan {
  propIndex: number;
  userIndex: number;
  rating: number;
  comment: string;
  daysAgo: number;
}

const REVIEW_PLANS: ReviewPlan[] = [
  { propIndex: 0, userIndex: 0, rating: 5, comment: 'Tempatnya sangat nyaman, bersih dan pemandangan bukitnya luar biasa asri.', daysAgo: 12 },
  { propIndex: 0, userIndex: 1, rating: 5, comment: 'Villa terbaik untuk istirahat di Dago! Udaranya sejuk dan staf sangat ramah.', daysAgo: 25 },
  { propIndex: 1, userIndex: 0, rating: 5, comment: 'Pemandangan Gunung Merapi dari balkon kamar spektakuler, sarapan juga lezat.', daysAgo: 15 },
  { propIndex: 1, userIndex: 1, rating: 4, comment: 'Kamar luas dan bersih, kasur empuk. Parkir luas dan resepsionis sigap 24 jam.', daysAgo: 30 },
  { propIndex: 2, userIndex: 0, rating: 4, comment: 'Lokasi super strategis di Senopati, jalan kaki ke kafe-kafe hits sangat dekat.', daysAgo: 8 },
  { propIndex: 2, userIndex: 1, rating: 4, comment: 'Unit loft modern dan bersih, WiFi sangat kencang untuk WFH.', daysAgo: 18 },
  { propIndex: 3, userIndex: 0, rating: 5, comment: 'Nuansa Jawa otentik yang hangat. Bangunan joglo antik bikin serasa pulang kampung.', daysAgo: 14 },
  { propIndex: 4, userIndex: 1, rating: 5, comment: 'Private pool villa yang tenang di Canggu, fasilitas lengkap dan bersih terawat.', daysAgo: 20 },
  { propIndex: 5, userIndex: 0, rating: 4, comment: 'Resort sejuk di Batu, pemandangan pohon pinusnya bikin adem dan rileks.', daysAgo: 9 },
  { propIndex: 5, userIndex: 1, rating: 3, comment: 'Tempatnya bagus dan sejuk, hanya air panas di kamar mandi perlu waktu untuk stabil.', daysAgo: 22 },
  { propIndex: 6, userIndex: 0, rating: 4, comment: 'Hotel heritage yang terawat di pusat Surabaya, dekat kemana-mana.', daysAgo: 16 },
  { propIndex: 7, userIndex: 1, rating: 5, comment: 'Suasana Ubud yang magis! Suara gemericik air dan pemandangan lembah juara.', daysAgo: 11 },
  { propIndex: 7, userIndex: 0, rating: 4, comment: 'Kamar nyaman dan asri, private pool bersih dan airnya menyegarkan.', daysAgo: 28 },
  { propIndex: 8, userIndex: 1, rating: 5, comment: 'Apartemen mewah di SCBD, pemandangan city light malam hari sangat memukau.', daysAgo: 7 },
  { propIndex: 9, userIndex: 0, rating: 4, comment: 'Dekat sekali dengan Malioboro, jalan kaki 5 menit sampai. Kamar bersih dan rapi.', daysAgo: 13 },
  { propIndex: 9, userIndex: 1, rating: 3, comment: 'Lokasi strategis tapi malam agak ramai suara jalan. Kamar bersih dan AC dingin.', daysAgo: 27 },
  { propIndex: 10, userIndex: 0, rating: 5, comment: 'Villa Puncak yang sempurna untuk liburan keluarga besar, kebun tehnya luas.', daysAgo: 19 },
  { propIndex: 11, userIndex: 1, rating: 5, comment: 'Seminyak oasis yang luar biasa, interior chic dan dekat pantai serta butik.', daysAgo: 6 },
  { propIndex: 11, userIndex: 0, rating: 4, comment: 'Desain interior sangat estetik, kamar wangi dan kolam renang bersih.', daysAgo: 21 },
  { propIndex: 12, userIndex: 1, rating: 4, comment: 'Suasana retro vintage di Braga yang unik, seru jalan kaki kuliner malam di sekitar.', daysAgo: 17 },
  { propIndex: 13, userIndex: 0, rating: 3, comment: 'Praktis dekat stasiun Gubeng, cocok untuk transit perjalanan bisnis singkat.', daysAgo: 24 },
  { propIndex: 14, userIndex: 1, rating: 5, comment: 'Pantai Senggigi tepat di depan pintu! Matahari terbenamnya tidak ada tandingannya.', daysAgo: 10 },
  { propIndex: 14, userIndex: 0, rating: 5, comment: 'Cottage eksotis yang tenang, staf sangat ramah dan membantu sewa kendaraan.', daysAgo: 26 },
  { propIndex: 15, userIndex: 1, rating: 4, comment: 'Konsep bohemian yang sangat artistik di Kemang, interior instagramable.', daysAgo: 15 },
  { propIndex: 16, userIndex: 0, rating: 5, comment: 'Kabin kayu di tengah hutan pinus Lembang yang sangat dingin dan damai.', daysAgo: 8 },
  { propIndex: 16, userIndex: 1, rating: 4, comment: 'Selimut tebal dan hangat, suasana berkabut pagi hari sangat magis.', daysAgo: 23 },
  { propIndex: 17, userIndex: 0, rating: 4, comment: 'Guesthouse nyaman di Prawirotaman, banyak kafe enak di sekitar penginapan.', daysAgo: 12 },
  { propIndex: 17, userIndex: 1, rating: 3, comment: 'Penginapan santai dan murah, kamar bersih meski ruang kamar mandinya kompak.', daysAgo: 29 },
  { propIndex: 18, userIndex: 0, rating: 5, comment: 'Sanur villa yang sangat damai, kolam teratai indah dan ranjang sangat empuk.', daysAgo: 14 },
  { propIndex: 19, userIndex: 1, rating: 4, comment: 'Pemandangan malam kota Batu dari ketinggian sangat indah, kamar bersih.', daysAgo: 18 },
  { propIndex: 20, userIndex: 0, rating: 5, comment: 'Apartemen modern di PIK, pemandangan teluk keren dan banyak pilihan kuliner.', daysAgo: 5 },
  { propIndex: 20, userIndex: 1, rating: 4, comment: 'Fasilitas gym dan kolam renang sangat bagus, kamar bersih dan terawat.', daysAgo: 20 },
  { propIndex: 21, userIndex: 1, rating: 5, comment: 'Resort bintang lima yang megah di Nusa Dua, pelayanan kelas dunia!', daysAgo: 9 },
  { propIndex: 21, userIndex: 0, rating: 5, comment: 'Taman tropisnya sangat terawat, pantai pasir putih bersih dan tenang.', daysAgo: 22 },
  { propIndex: 22, userIndex: 0, rating: 4, comment: 'Guesthouse klasik di Jalan Riau, dekat outlet belanja dan kuliner Bandung.', daysAgo: 16 },
  { propIndex: 23, userIndex: 1, rating: 4, comment: 'Akomodasi pod modern di Kuta yang praktis, dekat pantai dan Beachwalk mall.', daysAgo: 11 },
  { propIndex: 23, userIndex: 0, rating: 3, comment: 'Kamar pod bersih dan privasi terjaga, pas untuk solo traveler yang aktif.', daysAgo: 31 },
  { propIndex: 24, userIndex: 0, rating: 5, comment: 'Apartemen Simpang Lima yang sangat strategis, kuliner malam tinggal jalan kaki.', daysAgo: 7 }
];

function buildPastDates(offsetDays: number) {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() - (offsetDays + 2));
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() - offsetDays);
  return { checkIn, checkOut };
}

function buildBookingPayload(prop: SeedPropertyRef, userId: string, code: string, daysAgo: number) {
  const room = prop.rooms[0];
  const { checkIn, checkOut } = buildPastDates(daysAgo);
  const totalPrice = room.basePrice * 2;
  const payment = {
    create: { paymentMethod: PaymentMethod.PAYMENT_GATEWAY, amount: totalPrice, status: PaymentStatus.SETTLEMENT, paidAt: checkIn, confirmedAt: checkIn, createdAt: checkIn }
  };
  return {
    bookingCode: code, userId, propertyId: prop.id, roomId: room.id,
    checkInDate: checkIn, checkOutDate: checkOut, totalNights: 2, guestCount: 2,
    totalPrice, status: BookingStatus.COMPLETED, expiresAt: checkIn, createdAt: checkIn, payment
  };
}

async function createReviewBooking(prisma: PrismaClient, prop: SeedPropertyRef, userId: string, code: string, daysAgo: number) {
  return prisma.booking.create({ data: buildBookingPayload(prop, userId, code, daysAgo) });
}

async function seedSingleReviewPlan(
  prisma: PrismaClient, p: ReviewPlan, prop: SeedPropertyRef, userId: string, code: string
) {
  const booking = await createReviewBooking(prisma, prop, userId, code, p.daysAgo);
  await prisma.review.create({
    data: {
      bookingId: booking.id, userId, propertyId: prop.id,
      rating: p.rating, comment: p.comment, createdAt: booking.checkOutDate
    }
  });
}

export async function seedPropertyReviews(
  prisma: PrismaClient, properties: SeedPropertyRef[], userIds: string[]
): Promise<void> {
  console.log('Seeding reviews for 25 properties with varied ratings...');
  for (let i = 0; i < REVIEW_PLANS.length; i++) {
    const p = REVIEW_PLANS[i];
    if (p.propIndex >= properties.length) continue;
    const prop = properties[p.propIndex];
    const userId = userIds[p.userIndex] || userIds[0];
    await seedSingleReviewPlan(prisma, p, prop, userId, `BK-RV-${p.propIndex + 1}-${i + 1}`);
  }
  console.log(`Reviews seeded: ${REVIEW_PLANS.length} reviews created for 25 properties.`);
}
