"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_CATEGORIES = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
const seed_categories_1 = require("./seed-categories");
Object.defineProperty(exports, "INITIAL_CATEGORIES", { enumerable: true, get: function () { return seed_categories_1.INITIAL_CATEGORIES; } });
const seed_users_1 = require("./seed-users");
const seed_images_1 = require("./seed-images");
const seed_props_data1_1 = require("./seed-props-data1");
const seed_props_data2_1 = require("./seed-props-data2");
const seed_props_data3_1 = require("./seed-props-data3");
const seed_reviews_1 = require("./seed-reviews");
const prisma = new client_1.PrismaClient();
async function cleanDatabase(prisma) {
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
async function seedCategories(prisma) {
    const map = {};
    for (const c of seed_categories_1.INITIAL_CATEGORIES) {
        const record = await prisma.propertyCategory.upsert({
            where: { slug: c.slug }, update: { name: c.name, description: c.description }, create: c
        });
        map[c.slug] = record.id;
    }
    return map;
}
async function seedPropertyGeneralImages(prisma, propId, imgs) {
    for (let idx = 0; idx < imgs.length; idx++) {
        await prisma.propertyImage.create({
            data: { propertyId: propId, roomId: null, imageUrl: imgs[idx].secureUrl, publicId: imgs[idx].publicId, isCover: idx === 0, order: idx }
        });
    }
}
async function seedSingleRoom(prisma, propId, r, imgs) {
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
async function seedRoomsForProperty(prisma, propId, rooms, rImgs, pIdx) {
    const roomsRef = [];
    for (let rIdx = 0; rIdx < rooms.length; rIdx++) {
        const slice = [rImgs[(pIdx * 4 + rIdx * 2) % rImgs.length], rImgs[(pIdx * 4 + rIdx * 2 + 1) % rImgs.length]];
        const room = await seedSingleRoom(prisma, propId, rooms[rIdx], slice);
        roomsRef.push({ id: room.id, basePrice: room.basePrice });
    }
    return roomsRef;
}
async function seedOneProperty(prisma, p, tenantId, catId, pImgs, rImgs, pIdx) {
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
async function seedAllProperties(prisma, allProps, users, cats, images) {
    const seededProps = [];
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
    const userMap = await (0, seed_users_1.seedDemoUsers)(prisma);
    const images = await (0, seed_images_1.ensureSeedImages)();
    const allProps = [...seed_props_data1_1.PROPERTIES_DATA_1, ...seed_props_data2_1.PROPERTIES_DATA_2, ...seed_props_data3_1.PROPERTIES_DATA_3];
    console.log(`Seeding ${allProps.length} properties...`);
    const seededProps = await seedAllProperties(prisma, allProps, userMap, catMap, images);
    const customerIds = [userMap['formalsquad.id@gmail.com'], userMap['ali.wpurbo@gmail.com']];
    await (0, seed_reviews_1.seedPropertyReviews)(prisma, seededProps, customerIds);
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
