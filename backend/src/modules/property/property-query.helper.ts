import { Prisma } from '@prisma/client';
import { GetTenantPropertiesQueryInput } from './property.schema';

function buildSearchOrCondition(s: string) {
  return [
    { title: { contains: s, mode: 'insensitive' as const } },
    { description: { contains: s, mode: 'insensitive' as const } },
    { city: { contains: s, mode: 'insensitive' as const } },
    { address: { contains: s, mode: 'insensitive' as const } },
  ];
}

export function buildTenantPropertyWhere(
  tenantId: string,
  query?: GetTenantPropertiesQueryInput
): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = { tenantId };
  if (query?.search?.trim()) where.OR = buildSearchOrCondition(query.search.trim());
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
