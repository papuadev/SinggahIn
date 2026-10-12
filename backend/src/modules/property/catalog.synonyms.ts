export const CITY_SYNONYMS: Record<string, string[]> = {
  diy: ['yogyakarta', 'sleman', 'bantul'],
  'daerah istimewa yogyakarta': ['yogyakarta', 'sleman', 'bantul'],
  jogja: ['yogyakarta'],
  yogya: ['yogyakarta'],
  yogyakarta: ['yogyakarta', 'jogja'],
  'dki jakarta': ['jakarta', 'jakarta selatan', 'jakarta pusat', 'jakarta timur', 'jakarta barat', 'jakarta utara'],
  jakarta: ['jakarta', 'jakarta selatan', 'jakarta pusat', 'jakarta timur', 'jakarta barat', 'jakarta utara'],
  'east jakarta': ['jakarta timur'],
  'south jakarta': ['jakarta selatan'],
  'west jakarta': ['jakarta barat'],
  'central jakarta': ['jakarta pusat'],
  'north jakarta': ['jakarta utara'],
  jaktim: ['jakarta timur'],
  jaksel: ['jakarta selatan'],
  jakbar: ['jakarta barat'],
  jakpus: ['jakarta pusat'],
  jakut: ['jakarta utara'],
  bali: ['badung', 'denpasar', 'gianyar', 'ubud', 'canggu', 'seminyak', 'kuta', 'bali'],
  'kota bandung': ['bandung'],
  'kabupaten bandung': ['bandung', 'bandung barat'],
  'kabupaten bandung barat': ['bandung barat'],
  lembang: ['bandung barat', 'lembang'],
  'kota surabaya': ['surabaya'],
  surakarta: ['solo'],
  solo: ['solo', 'surakarta'],
};

function getStrippedKeyword(raw: string): string {
  return raw
    .replace(/^kota administrasi\s+/i, '')
    .replace(/^kota\s+/i, '')
    .replace(/^kabupaten\s+/i, '')
    .replace(/^kab\.\s+/i, '')
    .trim();
}

export function expandCitySynonyms(keyword: string): string[] {
  const norm = keyword.trim().toLowerCase();
  if (!norm) return [];
  const direct = CITY_SYNONYMS[norm];
  if (direct) return Array.from(new Set([norm, ...direct]));
  const stripped = getStrippedKeyword(norm);
  if (stripped && stripped !== norm) {
    const strippedMatches = CITY_SYNONYMS[stripped] || [];
    return Array.from(new Set([norm, stripped, ...strippedMatches]));
  }
  return [norm];
}
