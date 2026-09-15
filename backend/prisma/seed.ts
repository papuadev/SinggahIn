import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const INITIAL_CATEGORIES = [
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

async function seedCategory(
  category: (typeof INITIAL_CATEGORIES)[number]
): Promise<void> {
  await prisma.propertyCategory.upsert({
    where: { slug: category.slug },
    update: {
      name: category.name,
      description: category.description
    },
    create: category
  });
}

async function seedDemoUsers(): Promise<void> {
  const hash = await bcrypt.hash('Password123!', 10);
  const users = [
    { email: 'user@example.com', name: 'Rian Pratama', role: Role.USER },
    { email: 'tenant@example.com', name: 'Sarah Wijaya', role: Role.TENANT },
  ];
  for (const u of users) {
    const data = { ...u, isVerified: true, passwordHash: hash };
    await prisma.user.upsert({ where: { email: u.email }, update: data, create: data });
  }
}

async function main(): Promise<void> {
  for (const category of INITIAL_CATEGORIES) {
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
