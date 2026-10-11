"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_CATEGORIES = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
const seed_categories_1 = require("./seed-categories");
Object.defineProperty(exports, "INITIAL_CATEGORIES", { enumerable: true, get: function () { return seed_categories_1.INITIAL_CATEGORIES; } });
const seed_users_1 = require("./seed-users");
const seed_props_part1_1 = require("./seed-props-part1");
const seed_props_part2_1 = require("./seed-props-part2");
const seed_reviews_1 = require("./seed-reviews");
const prisma = new client_1.PrismaClient();
async function seedCategory(prisma, cat) {
    return prisma.propertyCategory.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description },
        create: cat
    });
}
async function seedCategories(prisma) {
    const map = {};
    for (const c of seed_categories_1.INITIAL_CATEGORIES) {
        const record = await seedCategory(prisma, c);
        map[c.slug] = record.id;
    }
    return map;
}
async function upsertProperty(prisma, p, tenantId, categoryId) {
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
async function upsertSingleRoom(prisma, propertyId, r) {
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
async function upsertPropertyRooms(prisma, propertyId, rooms) {
    const seededRooms = [];
    for (const r of rooms) {
        const room = await upsertSingleRoom(prisma, propertyId, r);
        seededRooms.push({ id: room.id, basePrice: room.basePrice });
    }
    return seededRooms;
}
async function seedSingleProperty(prisma, p, userMap, catMap) {
    const tenantId = userMap[p.tenantEmail];
    const categoryId = catMap[p.categorySlug];
    const prop = await upsertProperty(prisma, p, tenantId, categoryId);
    const rooms = await upsertPropertyRooms(prisma, prop.id, p.rooms);
    return { id: prop.id, title: prop.title, rooms };
}
async function seedAllProperties(prisma, userMap, catMap) {
    const allDefs = [...seed_props_part1_1.PROPERTIES_PART_1, ...seed_props_part2_1.PROPERTIES_PART_2];
    const results = [];
    for (const def of allDefs) {
        results.push(await seedSingleProperty(prisma, def, userMap, catMap));
    }
    return results;
}
async function main() {
    console.log('🌱 Starting database seed...');
    const catMap = await seedCategories(prisma);
    const userMap = await (0, seed_users_1.seedDemoUsers)(prisma);
    const seededProps = await seedAllProperties(prisma, userMap, catMap);
    const normalUserIds = [userMap['user@example.com'], userMap['user2@example.com']];
    await (0, seed_reviews_1.seedPropertyReviews)(prisma, seededProps, normalUserIds);
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
