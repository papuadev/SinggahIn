import { Prisma } from '@prisma/client';
import { GetTenantPropertiesQueryInput } from './property.schema';

export function buildTenantPropertyWhere(
  tenantId: string,
  query?: GetTenantPropertiesQueryInput
): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = { tenantId };
  if (query?.search?.trim()) {
    const s = query.search.trim();
    where.OR = [
      { title: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
      { city: { contains: s, mode: 'insensitive' } },
      { address: { contains: s, mode: 'insensitive' } },
    ];
  }
  if (query?.categoryId?.trim()) where.categoryId = query.categoryId.trim();
  return where;
}

export function buildTenantPropertyOrderBy(sortBy?: string): Prisma.PropertyOrderByWithRelationInput {
  switch (sortBy) {
    case 'createdAt_asc': return { createdAt: 'asc' };
    case 'title_asc': return { title: 'asc' };
    case 'title_desc': return { title: 'desc' };
    case 'city_asc': return { city: 'asc' };
    default: return { createdAt: 'desc' };
  }
}
