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
        email: 'wafflecraft.id@gmail.com',
        name: 'Natan Budi',
        role: client_1.Role.TENANT,
        phoneNumber: '081234567801'
    },
    {
        email: 'nilm.atelier@gmail.com',
        name: 'Agung Setyo',
        role: client_1.Role.TENANT,
        phoneNumber: '081234567802'
    },
    {
        email: 'formalsquad.id@gmail.com',
        name: 'Nolan Ari',
        role: client_1.Role.USER,
        phoneNumber: '081234567803'
    },
    {
        email: 'ali.wpurbo@gmail.com',
        name: 'Ali Mustofa',
        role: client_1.Role.USER,
        phoneNumber: '081234567804'
    }
];
async function upsertSingleUser(prisma, u, hash) {
    const data = {
        email: u.email, name: u.name, role: u.role, phoneNumber: u.phoneNumber,
        isVerified: true, passwordHash: hash
    };
    const user = await prisma.user.upsert({ where: { email: u.email }, update: data, create: data });
    return user.id;
}
async function seedDemoUsers(prisma) {
    const hash = await bcryptjs_1.default.hash('jangantanya', 10);
    const userMap = {};
    for (const u of exports.SEED_USERS) {
        userMap[u.email] = await upsertSingleUser(prisma, u, hash);
    }
    return userMap;
}
