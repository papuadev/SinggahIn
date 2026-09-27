"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_CATEGORIES = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
exports.INITIAL_CATEGORIES = [
    {
        name: 'Villa',
        slug: 'villa',
        description: 'Rumah liburan privat eksklusif dengan fasilitas lengkap'
    },
    {
        name: 'Hotel',
        slug: 'hotel',
        description: 'Akomodasi kamar berstandar hotel dengan layanan resepsionis'
    },
    {
        name: 'Apartemen',
        slug: 'apartemen',
        description: 'Unit hunian modern di pusat kota dengan akses mandiri'
    },
    {
        name: 'Homestay',
        slug: 'homestay',
        description: 'Penginapan ramah bernuansa lokal dengan suasana kekeluargaan'
    },
    {
        name: 'Guesthouse',
        slug: 'guesthouse',
        description: 'Penginapan hemat untuk traveler dan backpacker'
    },
    {
        name: 'Others',
        slug: 'others',
        description: 'Akomodasi unik lainnya seperti glamping, kabin, atau resort'
    }
];
async function seedCategory(category) {
    await prisma.propertyCategory.upsert({
        where: { slug: category.slug },
        update: {
            name: category.name,
            description: category.description
        },
        create: category
    });
}
async function seedDemoUsers() {
    const hash = await bcryptjs_1.default.hash('Password123!', 10);
    const users = [
        { email: 'user@example.com', name: 'Rian Pratama', role: client_1.Role.USER },
        { email: 'tenant@example.com', name: 'Sarah Wijaya', role: client_1.Role.TENANT },
    ];
    for (const u of users) {
        const data = { ...u, isVerified: true, passwordHash: hash };
        await prisma.user.upsert({ where: { email: u.email }, update: data, create: data });
    }
}
async function main() {
    for (const category of exports.INITIAL_CATEGORIES) {
        await seedCategory(category);
    }
    await seedDemoUsers();
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
