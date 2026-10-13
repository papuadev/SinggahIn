import { prisma } from '../../shared/services/prisma.service';
import { AppError } from '../../shared/utils/app-error';
import {
  PROTECTED_CATEGORY_SLUGS,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category.schema';

export function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isProtectedCategory(slug: string): boolean {
  return (PROTECTED_CATEGORY_SLUGS as readonly string[]).includes(slug.toLowerCase());
}

function mapCategoryRecord(cat: any) {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    tenantId: cat.tenantId ?? null,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
    isProtected: isProtectedCategory(cat.slug),
    propertyCount: cat._count?.properties ?? 0,
  };
}

function sortCategories(list: any[]) {
  return list.sort((a, b) => {
    if (a.isProtected === b.isProtected) return a.name.localeCompare(b.name);
    return a.isProtected ? -1 : 1;
  });
}

function buildCategoryWhere(activeOnly?: boolean) {
  if (!activeOnly) return {};
  return {
    OR: [
      { slug: { in: [...PROTECTED_CATEGORY_SLUGS] } },
      { properties: { some: {} } },
    ],
  };
}

export async function getAllCategories(activeOnly?: boolean) {
  const where = buildCategoryWhere(activeOnly);
  const list = await prisma.propertyCategory.findMany({
    where,
    include: { _count: { select: { properties: true } } },
    orderBy: { name: 'asc' },
  });
  return sortCategories(list.map(mapCategoryRecord));
}

export async function createCategory(tenantId: string, input: CreateCategoryInput) {
  const slug = slugifyCategory(input.name);
  if (!slug) throw AppError.badRequest('Nama kategori tidak menghasilkan slug yang valid.');
  const existing = await prisma.propertyCategory.findFirst({
    where: { OR: [{ name: { equals: input.name, mode: 'insensitive' } }, { slug }] },
  });
  if (existing) throw AppError.conflict('Kategori dengan nama atau slug ini sudah terdaftar.');
  const created = await prisma.propertyCategory.create({
    data: { tenantId, name: input.name.trim(), slug, description: input.description?.trim() || null },
  });
  return mapCategoryRecord(created);
}

async function verifyCategoryUpdate(id: string, tenantId: string, name: string, newSlug: string) {
  const cat = await prisma.propertyCategory.findUnique({ where: { id } });
  if (!cat) throw AppError.notFound('Kategori properti tidak ditemukan.');
  if (isProtectedCategory(cat.slug)) throw AppError.forbidden('Kategori bawaan sistem tidak dapat diubah.');
  if (cat.tenantId && cat.tenantId !== tenantId) {
    throw AppError.forbidden('Anda tidak memiliki akses untuk mengubah kategori ini.');
  }
  const conflict = await prisma.propertyCategory.findFirst({
    where: { id: { not: id }, OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug: newSlug }] },
  });
  if (conflict) throw AppError.conflict('Nama kategori sudah digunakan.');
  return cat;
}

export async function updateCategory(id: string, tenantId: string, input: UpdateCategoryInput) {
  const newSlug = slugifyCategory(input.name);
  if (!newSlug) throw AppError.badRequest('Nama kategori tidak valid.');
  await verifyCategoryUpdate(id, tenantId, input.name, newSlug);
  const updated = await prisma.propertyCategory.update({
    where: { id },
    data: { name: input.name.trim(), slug: newSlug, description: input.description?.trim() || null },
  });
  return mapCategoryRecord(updated);
}

export async function deleteCategory(id: string, tenantId: string) {
  const cat = await prisma.propertyCategory.findUnique({
    where: { id },
    include: { _count: { select: { properties: true } } },
  });
  if (!cat) throw AppError.notFound('Kategori properti tidak ditemukan.');
  if (isProtectedCategory(cat.slug)) throw AppError.forbidden('Kategori bawaan sistem tidak dapat dihapus.');
  if (cat.tenantId && cat.tenantId !== tenantId) {
    throw AppError.forbidden('Anda tidak memiliki akses untuk menghapus kategori ini.');
  }
  if (cat._count.properties > 0) {
    throw AppError.badRequest(`Kategori tidak dapat dihapus karena masih digunakan oleh ${cat._count.properties} properti.`);
  }
  await prisma.propertyCategory.delete({ where: { id } });
}
