"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_USERS = void 0;
exports.seedDemoUsers = seedDemoUsers;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.SEED_USERS = [
    {
        email: 'tenant@example.com',
        name: 'Sarah Wijaya',
        role: client_1.Role.TENANT,
        phoneNumber: '081234567801'
    },
    {
        email: 'tenant2@example.com',
        name: 'Budi Santoso',
        role: client_1.Role.TENANT,
        phoneNumber: '081234567802'
    },
    {
        email: 'user@example.com',
        name: 'Rian Pratama',
        role: client_1.Role.USER,
        phoneNumber: '081234567803'
    },
    {
        email: 'user2@example.com',
        name: 'Dinda Lestari',
        role: client_1.Role.USER,
        phoneNumber: '081234567804'
    }
];
async function seedDemoUsers(prisma) {
    const hash = await bcryptjs_1.default.hash('Password123!', 10);
    const userMap = {};
    for (const u of exports.SEED_USERS) {
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
