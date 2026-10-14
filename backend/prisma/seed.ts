import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { INITIAL_CATEGORIES } from './seed-categories';
import { seedDemoUsers } from './seed-users';
import { SeedImageResult, ensureSeedImages } from './seed-images';
import { SeedRoomDef, SeedPropertyDef } from './seed-types';
import { PROPERTIES_DATA_1 } from './seed-props-data1';
import { PROPERTIES_DATA_2 } from './seed-props-data2';
import { PROPERTIES_DATA_3 } from './seed-props-data3';
import { seedPropertyReviews, SeedPropertyRef } from './seed-reviews';

export { INITIAL_CATEGORIES };

const prisma = new PrismaClient();

async function cleanDatabase(prisma: PrismaClient) {
  console.log('Cleaning existing records...');
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.roomPriceModifier.deleteMany();
  await prisma.roomUnavailability.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.room.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany({
    where: { email: { in: ['tenant@example.com', 'tenant2@example.com', 'user@example.com', 'user2@example.com'] } }
  });
}

async function seedCategories(prisma: PrismaClient): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const c of INITIAL_CATEGORIES) {
    const record = await prisma.propertyCategory.upsert({
      where: { slug: c.slug }, update: { name: c.name, description: c.description }, create: c
    });
    map[c.slug] = record.id;
  }
  return map;
}

async function seedPropertyGeneralImages(prisma: PrismaClient, propId: string, imgs: SeedImageResult[]) {
  for (let idx = 0; idx < imgs.length; idx++) {
    await prisma.propertyImage.create({
      data: { propertyId: propId, roomId: null, imageUrl: imgs[idx].secureUrl, publicId: imgs[idx].publicId, isCover: idx === 0, order: idx }
    });
  }
}

async function seedSingleRoom(prisma: PrismaClient, propId: string, r: SeedRoomDef, imgs: SeedImageResult[]) {
  const room = await prisma.room.create({
    data: { propertyId: propId, name: r.name, basePrice: r.basePrice, capacity: r.capacity, totalUnits: r.totalUnits, description: r.description }
  });
  for (let idx = 0; idx < imgs.length; idx++) {
    await prisma.propertyImage.create({
      data: { propertyId: propId, roomId: room.id, imageUrl: imgs[idx].secureUrl, publicId: imgs[idx].publicId, isCover: false, order: idx }
    });
  }
  return room;
}

async function seedRoomsForProperty(
  prisma: PrismaClient, propId: string, rooms: SeedRoomDef[], rImgs: SeedImageResult[], pIdx: number
) {
  const roomsRef: Array<{ id: string; basePrice: number }> = [];
  for (let rIdx = 0; rIdx < rooms.length; rIdx++) {
    const slice = [rImgs[(pIdx * 4 + rIdx * 2) % rImgs.length], rImgs[(pIdx * 4 + rIdx * 2 + 1) % rImgs.length]];
    const room = await seedSingleRoom(prisma, propId, rooms[rIdx], slice);
    roomsRef.push({ id: room.id, basePrice: room.basePrice });
  }
  return roomsRef;
}

async function seedOneProperty(
  prisma: PrismaClient, p: SeedPropertyDef, tenantId: string, catId: string,
  pImgs: SeedImageResult[], rImgs: SeedImageResult[], pIdx: number
): Promise<SeedPropertyRef> {
  const prop = await prisma.property.create({
    data: {
      title: p.title, description: p.description, address: p.address, city: p.city,
      latitude: p.latitude, longitude: p.longitude, facilities: p.facilities, tenantId, categoryId: catId
    }
  });
  await seedPropertyGeneralImages(prisma, prop.id, pImgs);
  const rooms = await seedRoomsForProperty(prisma, prop.id, p.rooms, rImgs, pIdx);
  return { id: prop.id, title: prop.title, rooms };
}

async function seedAllProperties(
  prisma: PrismaClient, allProps: SeedPropertyDef[], users: Record<string, string>, cats: Record<string, string>,
  images: { properties: SeedImageResult[]; rooms: SeedImageResult[] }
): Promise<SeedPropertyRef[]> {
  const seededProps: SeedPropertyRef[] = [];
  for (let i = 0; i < allProps.length; i++) {
    const p = allProps[i];
    const tenantId = users[p.tenantEmail];
    const catId = cats[p.categorySlug];
    const pImgs = [images.properties[(i * 3) % images.properties.length], images.properties[(i * 3 + 1) % images.properties.length], images.properties[(i * 3 + 2) % images.properties.length]];
    const seeded = await seedOneProperty(prisma, p, tenantId, catId, pImgs, images.rooms, i);
    seededProps.push(seeded);
  }
  return seededProps;
}

async function main() {
  console.log('--- Starting SinggahIn Database Seeder ---');
  await cleanDatabase(prisma);
  const catMap = await seedCategories(prisma);
  const userMap = await seedDemoUsers(prisma);
  const images = await ensureSeedImages();
  const allProps = [...PROPERTIES_DATA_1, ...PROPERTIES_DATA_2, ...PROPERTIES_DATA_3];
  console.log(`Seeding ${allProps.length} properties...`);
  const seededProps = await seedAllProperties(prisma, allProps, userMap, catMap, images);
  const customerIds = [userMap['formalsquad.id@gmail.com'], userMap['ali.wpurbo@gmail.com']];
  await seedPropertyReviews(prisma, seededProps, customerIds);
  console.log('--- Seeding successfully finished! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
