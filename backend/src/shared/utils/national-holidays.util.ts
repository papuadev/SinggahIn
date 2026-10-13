export interface IndonesianHolidayInfo {
  isHoliday: boolean;
  name?: string;
}

const FIXED_ANNUAL_HOLIDAYS: Record<string, string> = {
  '01-01': 'Tahun Baru Masehi',
  '05-01': 'Hari Buruh Internasional',
  '06-01': 'Hari Lahir Pancasila',
  '08-17': 'Hari Kemerdekaan RI',
  '12-25': 'Hari Raya Natal',
};

const VARIABLE_HOLIDAYS: Record<string, string> = {
  '2024-02-08': "Isra Mi'raj",
  '2024-02-10': 'Tahun Baru Imlek',
  '2024-03-11': 'Hari Suci Nyepi',
  '2024-03-29': 'Wafat Yesus Kristus',
  '2024-03-31': 'Hari Paskah',
  '2024-04-10': 'Hari Raya Idul Fitri',
  '2024-04-11': 'Hari Raya Idul Fitri',
  '2024-05-09': 'Kenaikan Yesus Kristus',
  '2024-05-23': 'Hari Raya Waisak',
  '2024-06-17': 'Hari Raya Idul Adha',
  '2024-07-07': 'Tahun Baru Islam',
  '2024-09-16': 'Maulid Nabi Muhammad SAW',
  '2025-01-27': "Isra Mi'raj",
  '2025-01-29': 'Tahun Baru Imlek',
  '2025-03-29': 'Hari Suci Nyepi',
  '2025-03-31': 'Hari Raya Idul Fitri',
  '2025-04-01': 'Hari Raya Idul Fitri',
  '2025-04-18': 'Wafat Yesus Kristus',
  '2025-04-20': 'Hari Paskah',
  '2025-05-12': 'Hari Raya Waisak',
  '2025-05-29': 'Kenaikan Yesus Kristus',
  '2025-06-06': 'Hari Raya Idul Adha',
  '2025-06-27': 'Tahun Baru Islam',
  '2025-09-05': 'Maulid Nabi Muhammad SAW',
  '2026-01-16': "Isra Mi'raj",
  '2026-02-17': 'Tahun Baru Imlek',
  '2026-03-19': 'Hari Suci Nyepi',
  '2026-03-20': 'Hari Raya Idul Fitri',
  '2026-03-21': 'Hari Raya Idul Fitri',
  '2026-04-03': 'Wafat Yesus Kristus',
  '2026-04-05': 'Kebangkitan Yesus Kristus',
  '2026-05-14': 'Kenaikan Yesus Kristus',
  '2026-05-27': 'Hari Raya Idul Adha',
  '2026-05-31': 'Hari Raya Waisak',
  '2026-06-16': 'Tahun Baru Islam',
  '2026-08-25': 'Maulid Nabi Muhammad SAW',
  '2027-02-06': 'Tahun Baru Imlek',
  '2027-03-09': 'Hari Raya Idul Fitri',
  '2027-03-10': 'Hari Raya Idul Fitri',
  '2027-03-26': 'Wafat Yesus Kristus',
  '2027-05-06': 'Kenaikan Yesus Kristus',
  '2027-05-17': 'Hari Raya Idul Adha',
  '2027-05-20': 'Hari Raya Waisak',
};

function formatIsoDateKey(input: Date | string): string {
  if (typeof input === 'string') return input.slice(0, 10);
  return input.toISOString().slice(0, 10);
}

export function getIndonesianNationalHoliday(input: Date | string): IndonesianHolidayInfo {
  const dStr = formatIsoDateKey(input);
  if (VARIABLE_HOLIDAYS[dStr]) {
    return { isHoliday: true, name: VARIABLE_HOLIDAYS[dStr] };
  }
  const monthDay = dStr.slice(5);
  if (FIXED_ANNUAL_HOLIDAYS[monthDay]) {
    return { isHoliday: true, name: FIXED_ANNUAL_HOLIDAYS[monthDay] };
  }
  return { isHoliday: false };
}

export function isIndonesianHoliday(input: Date | string): boolean {
  return getIndonesianNationalHoliday(input).isHoliday;
}
