import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { SEOHead } from '../SEOHead';
import { createLodgingBusinessSchema } from '../../../libs/seo';

const sampleOGProps = {
  title: 'Luxury Resort',
  description: 'Resort bintang 5 di Bali',
  ogImage: 'https://cdn.com/resort.webp',
  ogPriceAmount: 1500000,
  ogPriceCurrency: 'IDR',
  canonicalUrl: 'https://singgahin.com/properties/resort-1',
};

function verifyOGElements() {
  expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Luxury Resort | SinggahIn');
  expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://cdn.com/resort.webp');
  expect(document.querySelector('meta[property="og:price:amount"]')?.getAttribute('content')).toBe('1500000');
  expect(document.querySelector('meta[property="og:price:currency"]')?.getAttribute('content')).toBe('IDR');
  expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://singgahin.com/properties/resort-1');
  expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
}

const sampleSchema = createLodgingBusinessSchema({
  title: 'Villa Nuansa Asri',
  description: 'Villa modern di Bandung',
  images: ['https://cdn.com/v1.webp'],
  address: 'Jl. Dago No. 12',
  city: 'Bandung',
  latitude: -6.87,
  longitude: 107.61,
  lowestPrice: 750000,
  averageRating: 4.8,
  totalReviews: 12,
});

function verifyJsonLdSchema() {
  const script = document.querySelector('script[type="application/ld+json"]');
  expect(script).not.toBeNull();
  const parsed = JSON.parse(script?.textContent || '{}');
  expect(parsed['@type']).toBe('LodgingBusiness');
  expect(parsed.name).toBe('Villa Nuansa Asri');
  expect(parsed.address.addressLocality).toBe('Bandung');
  expect(parsed.geo.latitude).toBe(-6.87);
  expect(parsed.priceRange).toBe('IDR 750000');
  expect(parsed.aggregateRating.reviewCount).toBe(12);
}

describe('SEOHead Component', () => {
  beforeEach(() => {
    document.title = '';
    const metas = document.querySelectorAll('meta, link[rel="canonical"], script[type="application/ld+json"]');
    metas.forEach((el) => el.remove());
  });

  it('renders default title and description when props are empty', async () => {
    render(<SEOHead />);
    await waitFor(() => {
      expect(document.title).toBe('SinggahIn - Sewa Penginapan & Villa Impian di Indonesia');
      const desc = document.querySelector('meta[name="description"]');
      expect(desc?.getAttribute('content')).toContain('Temukan hotel, villa, dan penginapan murah');
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots?.getAttribute('content')).toBe('index, follow');
    });
  });

  it('formats custom title with brand suffix without duplicating', async () => {
    render(<SEOHead title="Villa Nuansa Asri" />);
    await waitFor(() => {
      expect(document.title).toBe('Villa Nuansa Asri | SinggahIn');
    });
  });

  it('preserves title that already has brand suffix', async () => {
    render(<SEOHead title="Katalog Villa Murah | SinggahIn" />);
    await waitFor(() => {
      expect(document.title).toBe('Katalog Villa Murah | SinggahIn');
    });
  });

  it('renders OpenGraph and Twitter tags including price', async () => {
    render(<SEOHead {...sampleOGProps} />);
    await waitFor(() => verifyOGElements());
  });

  it('renders noindex robot tag when noIndex is true', async () => {
    render(<SEOHead title="Private Page" noIndex />);
    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    });
  });

  it('injects JSON-LD script for LodgingBusiness schema', async () => {
    render(<SEOHead title="Villa Nuansa Asri" jsonLd={sampleSchema} />);
    await waitFor(() => verifyJsonLdSchema());
  });
});
