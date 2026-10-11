import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface SeedUserDef {
  email: string;
  name: string;
  role: Role;
  phoneNumber: string;
}

export const SEED_USERS: SeedUserDef[] = [
  {
    email: 'tenant@example.com',
    name: 'Sarah Wijaya',
    role: Role.TENANT,
    phoneNumber: '081234567801'
  },
  {
    email: 'tenant2@example.com',
    name: 'Budi Santoso',
    role: Role.TENANT,
    phoneNumber: '081234567802'
  },
  {
    email: 'user@example.com',
    name: 'Rian Pratama',
    role: Role.USER,
    phoneNumber: '081234567803'
  },
  {
    email: 'user2@example.com',
    name: 'Dinda Lestari',
    role: Role.USER,
    phoneNumber: '081234567804'
  }
];

export async function seedDemoUsers(prisma: PrismaClient): Promise<Record<string, string>> {
  const hash = await bcrypt.hash('Password123!', 10);
  const userMap: Record<string, string> = {};

  for (const u of SEED_USERS) {
    const data = {
      email: u.email,
      name: u.name,
      role: u.role,
      phoneNumber: u.phoneNumber,
      isVerified: true,
      passwordHash: hash
    };
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: data,
      create: data
    });
    userMap[u.email] = user.id;
  }

  return userMap;
}
