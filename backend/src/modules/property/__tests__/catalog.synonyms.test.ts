import { describe, it, expect } from 'vitest';
import { expandCitySynonyms } from '../catalog.synonyms';

describe('Catalog Synonyms - expandCitySynonyms', () => {
  it('returns empty array when keyword is empty or whitespace', () => {
    expect(expandCitySynonyms('')).toEqual([]);
    expect(expandCitySynonyms('   ')).toEqual([]);
  });

  it('expands DIY and Jogja to Yogyakarta and its regencies', () => {
    const diyResults = expandCitySynonyms('DIY');
    expect(diyResults).toContain('yogyakarta');
    expect(diyResults).toContain('sleman');
    expect(diyResults).toContain('bantul');

    const jogjaResults = expandCitySynonyms('Jogja');
    expect(jogjaResults).toContain('yogyakarta');
  });

  it('expands English Jakarta regencies to Indonesian names', () => {
    const eastJakarta = expandCitySynonyms('East Jakarta');
    expect(eastJakarta).toContain('jakarta timur');

    const southJakarta = expandCitySynonyms('South Jakarta');
    expect(southJakarta).toContain('jakarta selatan');
  });

  it('strips administrative prefixes like Kota Administrasi and Kota', () => {
    const kotaBandung = expandCitySynonyms('Kota Bandung');
    expect(kotaBandung).toContain('bandung');

    const adminJakTim = expandCitySynonyms('Kota Administrasi Jakarta Timur');
    expect(adminJakTim).toContain('jakarta timur');
  });

  it('expands Bali to include its tourist regencies', () => {
    const bali = expandCitySynonyms('Bali');
    expect(bali).toContain('badung');
    expect(bali).toContain('gianyar');
    expect(bali).toContain('denpasar');
  });
});
