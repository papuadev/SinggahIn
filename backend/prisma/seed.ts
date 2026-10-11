import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { INITIAL_CATEGORIES } from './seed-categories';
import { seedDemoUsers } from './seed-users';
import { PROPERTIES_PART_1, SeedPropertyDef } from './seed-props-part1';
import { PROPERTIES_PART_2 } from './seed-props-part2';
import { seedPropertyReviews, SeedPropertyRef } from './seed-reviews';

export { INITIAL_CATEGORIES };

const prisma = new PrismaClient();

async function seedCategory(prisma: PrismaClient, cat: (typeof INITIAL_CATEGORIES)[number]) {
  return prisma.propertyCategory.upsert({
    where: { slug: cat.slug },
    update: { name: cat.name, description: cat.description },
    create: cat
  });
}

async function seedCategories(prisma: PrismaClient): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const c of INITIAL_CATEGORIES) {
    const record = await seedCategory(prisma, c);
    map[c.slug] = record.id;
  }
  return map;
}

async function upsertProperty(prisma: PrismaClient, p: SeedPropertyDef, tenantId: string, categoryId: string) {
  const existing = await prisma.property.findFirst({
    where: { title: p.title, tenantId }
  });
  if (existing) {
    return prisma.property.update({
      where: { id: existing.id },
      data: { description: p.description, address: p.address, city: p.city, latitude: p.latitude, longitude: p.longitude, facilities: p.facilities, categoryId }
    });
  }
  return prisma.property.create({
    data: { title: p.title, description: p.description, address: p.address, city: p.city, latitude: p.latitude, longitude: p.longitude, facilities: p.facilities, tenantId, categoryId }
  });
}

async function upsertSingleRoom(prisma: PrismaClient, propertyId: string, r: SeedPropertyDef['rooms'][number]) {
  const existing = await prisma.room.findFirst({ where: { propertyId, name: r.name } });
  if (existing) {
    return prisma.room.update({
      where: { id: existing.id },
      data: { basePrice: r.basePrice, capacity: r.capacity, totalUnits: r.totalUnits, description: r.description }
    });
  }
  return prisma.room.create({
    data: { propertyId, name: r.name, basePrice: r.basePrice, capacity: r.capacity, totalUnits: r.totalUnits, description: r.description }
  });
}

async function upsertPropertyRooms(prisma: PrismaClient, propertyId: string, rooms: SeedPropertyDef['rooms']) {
  const seededRooms = [];
  for (const r of rooms) {
    const room = await upsertSingleRoom(prisma, propertyId, r);
    seededRooms.push({ id: room.id, basePrice: room.basePrice });
  }
  return seededRooms;
}

async function seedSingleProperty(
  prisma: PrismaClient, p: SeedPropertyDef, userMap: Record<string, string>, catMap: Record<string, string>
): Promise<SeedPropertyRef> {
  const tenantId = userMap[p.tenantEmail];
  const categoryId = catMap[p.categorySlug];
  const prop = await upsertProperty(prisma, p, tenantId, categoryId);
  const rooms = await upsertPropertyRooms(prisma, prop.id, p.rooms);
  return { id: prop.id, title: prop.title, rooms };
}

async function seedAllProperties(
  prisma: PrismaClient, userMap: Record<string, string>, catMap: Record<string, string>
): Promise<SeedPropertyRef[]> {
  const allDefs = [...PROPERTIES_PART_1, ...PROPERTIES_PART_2];
  const results: SeedPropertyRef[] = [];
  for (const def of allDefs) {
    results.push(await seedSingleProperty(prisma, def, userMap, catMap));
  }
  return results;
}

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');
  const catMap = await seedCategories(prisma);
  const userMap = await seedDemoUsers(prisma);
  const seededProps = await seedAllProperties(prisma, userMap, catMap);
  const normalUserIds = [userMap['user@example.com'], userMap['user2@example.com']];
  await seedPropertyReviews(prisma, seededProps, normalUserIds);
  console.log(`✅ Seed finished successfully: 6 categories, 4 users, ${seededProps.length} properties with rooms and reviews.`);
}

if (process.env.NODE_ENV !== 'test') {
  main()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
