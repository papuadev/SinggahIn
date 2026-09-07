import { describe, it, expect } from 'vitest';
import { INITIAL_CATEGORIES } from '../../prisma/seed';

describe('Database Seed Specification', () => {
  it('should define exactly 6 initial property categories', () => {
    expect(INITIAL_CATEGORIES).toHaveLength(6);
  });

  it('should have unique slugs for all categories', () => {
    const slugs = INITIAL_CATEGORIES.map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('should contain all required categories from specification', () => {
    const expectedSlugs = [
      'villa',
      'hotel',
      'apartemen',
      'homestay',
      'guesthouse',
      'others'
    ];
    const actualSlugs = INITIAL_CATEGORIES.map((c) => c.slug);
    expect(actualSlugs).toEqual(expect.arrayContaining(expectedSlugs));
  });

  it('each category should have non-empty name and description', () => {
    INITIAL_CATEGORIES.forEach((cat) => {
      expect(cat.name).toBeTruthy();
      expect(cat.description).toBeTruthy();
      expect(cat.slug).toBeTruthy();
    });
  });
});
