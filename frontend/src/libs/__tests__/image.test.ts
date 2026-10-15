import { describe, it, expect } from 'vitest';
import { optimizeImageUrl } from '../image';

describe('optimizeImageUrl', () => {
  it('returns empty string when url is empty or null', () => {
    expect(optimizeImageUrl('')).toBe('');
    expect(optimizeImageUrl(null)).toBe('');
    expect(optimizeImageUrl(undefined)).toBe('');
  });

  it('transforms Cloudinary URL with width and height', () => {
    const input = 'https://res.cloudinary.com/test/image/upload/sample.webp';
    const output = optimizeImageUrl(input, 400, 300);
    expect(output).toBe('https://res.cloudinary.com/test/image/upload/c_fill,w_400,h_300,f_auto,q_auto/sample.webp');
  });

  it('transforms Cloudinary URL with width only', () => {
    const input = 'https://res.cloudinary.com/test/image/upload/sample.webp';
    const output = optimizeImageUrl(input, 400);
    expect(output).toBe('https://res.cloudinary.com/test/image/upload/c_limit,w_400,f_auto,q_auto/sample.webp');
  });

  it('does not re-transform already transformed Cloudinary URLs', () => {
    const input = 'https://res.cloudinary.com/test/image/upload/c_fill,w_400/sample.webp';
    expect(optimizeImageUrl(input, 600)).toBe(input);
  });

  it('returns untouched URL for non-Cloudinary images', () => {
    const unsplash = 'https://images.unsplash.com/photo-1580587771525';
    expect(optimizeImageUrl(unsplash)).toBe(unsplash);
    expect(optimizeImageUrl('/logo.webp')).toBe('/logo.webp');
  });
});
