import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User, TokenType } from "@prisma/client";
import { prisma } from "../../shared/services/prisma.service";
import { sendVerificationEmail } from "../../shared/services/mail.service";
import { signToken } from "../../shared/services/token.service";
import { AppError } from "../../shared/utils/app-error";
import {
  RegisterInput,
  VerifyInput,
  LoginInput,
  UserResponseDto,
} from "./identity.types";

function toUserDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    phoneNumber: user.phoneNumber,
  };
}

async function findOrCreateUser(input: RegisterInput): Promise<User> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing?.isVerified) {
    throw AppError.conflict("Email sudah terdaftar. Silakan login.");
  }
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { role: input.role },
    });
  }
  return prisma.user.create({
    data: { email: input.email, role: input.role, isVerified: false },
  });
}

async function createToken(userId: string, email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.verificationToken.create({
    data: {
      userId,
      email,
      token,
      type: TokenType.ACCOUNT_VERIFICATION,
      expiresAt,
    },
  });
  return token;
}

export async function register(
  input: RegisterInput,
): Promise<{ email: string; role: string }> {
  const user = await findOrCreateUser(input);
  const token = await createToken(user.id, user.email);
  await sendVerificationEmail(user.email, token);
  return { email: user.email, role: user.role };
}

async function fetchValidToken(token: string) {
  const record = await prisma.verificationToken.findFirst({
    where: { token, type: TokenType.ACCOUNT_VERIFICATION, isUsed: false },
  });
  if (!record || record.expiresAt < new Date()) {
    throw AppError.badRequest(
      "Token verifikasi tidak valid atau telah kedaluwarsa.",
    );
  }
  return record;
}

async function executeVerification(
  tokenId: string,
  userId: string,
  name: string,
  hash: string,
): Promise<User> {
  return prisma.$transaction(async (tx) => {
    await tx.verificationToken.update({
      where: { id: tokenId },
      data: { isUsed: true },
    });
    return tx.user.update({
      where: { id: userId },
      data: { name, passwordHash: hash, isVerified: true },
    });
  });
}

export async function verifyAccount(
  input: VerifyInput,
): Promise<{ user: UserResponseDto; token: string }> {
  const tokenRecord = await fetchValidToken(input.token);
  const hash = await bcrypt.hash(input.password, 10);
  const user = await executeVerification(
    tokenRecord.id,
    tokenRecord.userId,
    input.name,
    hash,
  );
  const jwt = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  return { user: toUserDto(user), token: jwt };
}

function checkUserStatus(user: User | null, role: string): void {
  if (!user || !user.passwordHash) {
    throw AppError.unauthorized("Kombinasi email dan password salah.");
  }
  if (!user.isVerified) {
    throw AppError.badRequest(
      "Akun belum diverifikasi. Silakan periksa email Anda.",
    );
  }
  if (user.role !== role) {
    throw AppError.badRequest(
      `Akun ini terdaftar sebagai ${user.role}. Silakan beralih ke form login ${user.role.toLowerCase()}.`,
    );
  }
}

async function verifyPassword(plain: string, hash: string): Promise<void> {
  const match = await bcrypt.compare(plain, hash);
  if (!match) {
    throw AppError.unauthorized("Kombinasi email dan password salah.");
  }
}

export async function login(
  input: LoginInput,
): Promise<{ user: UserResponseDto; token: string }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });
  checkUserStatus(user, input.role);
  const validUser = user as User;
  await verifyPassword(input.password, validUser.passwordHash as string);
  const jwt = signToken({
    userId: validUser.id,
    email: validUser.email,
    role: validUser.role,
  });
  return { user: toUserDto(validUser), token: jwt };
}

export async function getProfile(userId: string): Promise<UserResponseDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw AppError.notFound("Pengguna tidak ditemukan.");
  }
  return toUserDto(user);
}
