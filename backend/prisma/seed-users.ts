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
    email: 'wafflecraft.id@gmail.com',
    name: 'Natan Budi',
    role: Role.TENANT,
    phoneNumber: '081234567801'
  },
  {
    email: 'nilm.atelier@gmail.com',
    name: 'Agung Setyo',
    role: Role.TENANT,
    phoneNumber: '081234567802'
  },
  {
    email: 'formalsquad.id@gmail.com',
    name: 'Nolan Ari',
    role: Role.USER,
    phoneNumber: '081234567803'
  },
  {
    email: 'ali.wpurbo@gmail.com',
    name: 'Ali Mustofa',
    role: Role.USER,
    phoneNumber: '081234567804'
  }
];

async function upsertSingleUser(prisma: PrismaClient, u: SeedUserDef, hash: string): Promise<string> {
  const data = {
    email: u.email, name: u.name, role: u.role, phoneNumber: u.phoneNumber,
    isVerified: true, passwordHash: hash
  };
  const user = await prisma.user.upsert({ where: { email: u.email }, update: data, create: data });
  return user.id;
}

export async function seedDemoUsers(prisma: PrismaClient): Promise<Record<string, string>> {
  const hash = await bcrypt.hash('jangantanya', 10);
  const userMap: Record<string, string> = {};
  for (const u of SEED_USERS) {
    userMap[u.email] = await upsertSingleUser(prisma, u, hash);
  }
  return userMap;
}
