export interface SeedRoomDef {
  name: string;
  basePrice: number;
  capacity: number;
  totalUnits: number;
  description: string;
}

export interface SeedPropertyDef {
  tenantEmail: string;
  categorySlug: string;
  title: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  facilities: string[];
  rooms: SeedRoomDef[];
}

export const PROPERTIES_PART_1: SeedPropertyDef[] = [
  {
    tenantEmail: 'tenant@example.com',
    categorySlug: 'villa',
    title: 'Villa Nuansa Asri Dago',
    description: 'Villa modern eksklusif di kawasan sejuk Dago Atas Bandung dengan pemandangan perbukitan hijau dan udara segar.',
    address: 'Jl. Dago Giri No. 88',
    city: 'Bandung',
    latitude: -6.87123,
    longitude: 107.61234,
    facilities: ['WiFi Kecepatan Tinggi', 'Kolam Renang', 'Area Parkir Gratis', 'Dapur & Alat Makan', 'Smart TV & Hiburan'],
    rooms: [
      { name: 'Deluxe Mountain Suite', basePrice: 750000, capacity: 2, totalUnits: 3, description: 'Kamar luas dengan balkon pribadi menghadap pemandangan bukit.' },
      { name: 'Family Garden Suite', basePrice: 1200000, capacity: 4, totalUnits: 2, description: 'Suite keluarga dengan akses langsung ke taman asri dan ruang santai.' }
    ]
  },
  {
    tenantEmail: 'tenant@example.com',
    categorySlug: 'hotel',
    title: 'Grand Merapi View Hotel',
    description: 'Hotel berbintang di Yogyakarta utara dengan panorama megah Gunung Merapi dan layanan resepsionis 24 jam.',
    address: 'Jl. Kaliurang KM 12',
    city: 'Yogyakarta',
    latitude: -7.71234,
    longitude: 110.40567,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Area Parkir Gratis', 'Resepsionis 24 Jam', 'Keamanan 24 Jam'],
    rooms: [
      { name: 'Superior Twin Room', basePrice: 450000, capacity: 2, totalUnits: 8, description: 'Dua ranjang single dengan fasilitas modern dan kamar mandi shower air hangat.' },
      { name: 'Deluxe King Room', basePrice: 650000, capacity: 2, totalUnits: 6, description: 'Kamar elegan dengan ranjang king size dan pemandangan Gunung Merapi.' },
      { name: 'Merapi Executive Suite', basePrice: 1100000, capacity: 3, totalUnits: 2, description: 'Suite mewah dengan ruang tamu terpisah, bathtub, dan panorama spektakuler.' }
    ]
  },
  {
    tenantEmail: 'tenant@example.com',
    categorySlug: 'apartemen',
    title: 'Senopati Urban Loft Apartment',
    description: 'Unit apartemen modern minimalis di pusat gaya hidup Senopati, dekat kafe ternama dan pusat bisnis SCBD.',
    address: 'Jl. Senopati Raya No. 42',
    city: 'Jakarta Selatan',
    latitude: -6.23456,
    longitude: 106.81234,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Area Parkir Gratis', 'Smart TV & Hiburan', 'Keamanan 24 Jam'],
    rooms: [
      { name: 'Studio Modern Loft', basePrice: 550000, capacity: 2, totalUnits: 4, description: 'Studio efisien berkonsep mezzanine dengan dapur kompak dan tempat kerja nyaman.' },
      { name: '2-Bedroom City Suite', basePrice: 950000, capacity: 4, totalUnits: 2, description: 'Apartemen 2 kamar tidur lengkap dengan ruang keluarga luas dan balkon kota.' }
    ]
  },
  {
    tenantEmail: 'tenant@example.com',
    categorySlug: 'homestay',
    title: 'Oemah Djogja Heritage Homestay',
    description: 'Penginapan otentik bernuansa rumah tradisional Jawa dengan keramahtamahan khas Jogja di lingkungan yang tenang.',
    address: 'Jl. Prawirotaman I No. 15',
    city: 'Yogyakarta',
    latitude: -7.8189,
    longitude: 110.3689,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Area Parkir Gratis', 'Dapur & Alat Makan'],
    rooms: [
      { name: 'Kamar Joglo Klasik', basePrice: 280000, capacity: 2, totalUnits: 5, description: 'Kamar bernuansa ukiran kayu jati kuno dengan fasilitas modern ber-AC.' },
      { name: 'Kamar Limasan Utama', basePrice: 420000, capacity: 3, totalUnits: 3, description: 'Kamar keluarga beratap limasan dengan teras menghadap taman asri.' }
    ]
  },
  {
    tenantEmail: 'tenant@example.com',
    categorySlug: 'guesthouse',
    title: 'Backpacker Haven Malioboro',
    description: 'Guesthouse hemat dan nyaman hanya 5 menit berjalan kaki dari Stasiun Tugu dan kawasan belanja Malioboro.',
    address: 'Jl. Sosrowijayan No. 28',
    city: 'Yogyakarta',
    latitude: -7.7912,
    longitude: 110.3645,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Resepsionis 24 Jam', 'Area Parkir Gratis'],
    rooms: [
      { name: 'Cozy Single Pod', basePrice: 120000, capacity: 1, totalUnits: 10, description: 'Pod privat single nyaman ber-AC cocok untuk solo traveler hemat.' },
      { name: 'Double Comfort Room', basePrice: 220000, capacity: 2, totalUnits: 6, description: 'Kamar privat queen bed dengan kamar mandi dalam dan WiFi kencang.' }
    ]
  },
  {
    tenantEmail: 'tenant@example.com',
    categorySlug: 'villa',
    title: 'Ubud Green Valley Eco Villa',
    description: 'Sanctuary privat di tengah ketenangan lembah hijau Ubud, dikelilingi sawah terasering dan suara gemericik air.',
    address: 'Jl. Raya Sayan No. 77',
    city: 'Gianyar',
    latitude: -8.5123,
    longitude: 115.2456,
    facilities: ['WiFi Kecepatan Tinggi', 'Kolam Renang', 'Dapur & Alat Makan', 'Area Parkir Gratis', 'Smart TV & Hiburan'],
    rooms: [
      { name: 'One-Bedroom Pool Villa', basePrice: 1450000, capacity: 2, totalUnits: 3, description: 'Villa privat romantis dengan private plunge pool dan pemandangan lembah sawah.' },
      { name: 'Two-Bedroom Valley Villa', basePrice: 2600000, capacity: 4, totalUnits: 2, description: 'Villa dua lantai dengan kolam renang infinity dan ruang santai semi terbuka.' }
    ]
  },
  {
    tenantEmail: 'tenant@example.com',
    categorySlug: 'hotel',
    title: 'Bintang Seminyak Boutique Hotel',
    description: 'Hotel butik trendi di jantung Seminyak, dekat dengan pantai, pusat perbelanjaan, dan restoran fine dining.',
    address: 'Jl. Kayu Aya No. 10B',
    city: 'Badung',
    latitude: -8.6876,
    longitude: 115.1567,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Resepsionis 24 Jam', 'Area Parkir Gratis', 'Keamanan 24 Jam'],
    rooms: [
      { name: 'Deluxe Pool Access', basePrice: 850000, capacity: 2, totalUnits: 5, description: 'Kamar lantai dasar dengan akses langsung melangkah ke kolam renang utama.' },
      { name: 'Premier Balcony Suite', basePrice: 1350000, capacity: 2, totalUnits: 3, description: 'Suite mewah di lantai atas dengan balkon luas pemandangan sunset Seminyak.' }
    ]
  },
  {
    tenantEmail: 'tenant@example.com',
    categorySlug: 'apartemen',
    title: 'Thamrin Residence Executive Suites',
    description: 'Apartemen premium di pusat kota Jakarta dengan akses langsung ke Grand Indonesia dan stasiun MRT Bundaran HI.',
    address: 'Jl. Kebon Kacang Raya No. 1',
    city: 'Jakarta Pusat',
    latitude: -6.1956,
    longitude: 106.8212,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Area Parkir Gratis', 'Smart TV & Hiburan', 'Keamanan 24 Jam'],
    rooms: [
      { name: 'Deluxe Studio', basePrice: 600000, capacity: 2, totalUnits: 5, description: 'Studio elegan fully furnished dengan dapur mini dan pemandangan skyline Jakarta.' },
      { name: '1-Bedroom Premiere', basePrice: 850000, capacity: 2, totalUnits: 3, description: 'Unit 1 kamar tidur terpisah dengan ruang keluarga nyaman dan mesin cuci.' },
      { name: '2-Bedroom Family', basePrice: 1400000, capacity: 4, totalUnits: 2, description: 'Unit 2 kamar tidur luas untuk keluarga dengan fasilitas dapur lengkap.' }
    ]
  },
  {
    tenantEmail: 'tenant@example.com',
    categorySlug: 'homestay',
    title: 'Rumah Kayu Batu Malang Homestay',
    description: 'Homestay bernuansa pondok kayu di kawasan wisata Batu Malang dengan udara pegunungan yang sejuk dan asri.',
    address: 'Jl. Oro-Oro Ombo No. 99',
    city: 'Batu',
    latitude: -7.8845,
    longitude: 112.5289,
    facilities: ['WiFi Kecepatan Tinggi', 'Area Parkir Gratis', 'Dapur & Alat Makan', 'Smart TV & Hiburan'],
    rooms: [
      { name: 'Kamar Pinus Standard', basePrice: 250000, capacity: 2, totalUnits: 4, description: 'Kamar dinding kayu alami beraroma pinus dengan selimut tebal dan pemanas air.' },
      { name: 'Kamar Cemara Family', basePrice: 450000, capacity: 4, totalUnits: 3, description: 'Kamar keluarga luas dengan 2 double bed dan balkon menghadap Gunung Panderman.' }
    ]
  },
  {
    tenantEmail: 'tenant@example.com',
    categorySlug: 'others',
    title: 'Glamping Pine Forest Lembang',
    description: 'Pengalaman berkemah mewah di tengah hutan pinus Lembang dengan fasilitas kasur hotel dan api unggun malam hari.',
    address: 'Jl. Maribaya Timur No. 101',
    city: 'Bandung Barat',
    latitude: -6.8123,
    longitude: 107.6456,
    facilities: ['WiFi Kecepatan Tinggi', 'Area Parkir Gratis', 'Resepsionis 24 Jam', 'Keamanan 24 Jam'],
    rooms: [
      { name: 'Deluxe Safari Tent', basePrice: 650000, capacity: 2, totalUnits: 6, description: 'Tenda safari eksklusif berlantai kayu dengan kasur queen dan teras pribadi.' },
      { name: 'Luxury Dome Tent', basePrice: 950000, capacity: 4, totalUnits: 4, description: 'Tenda kubah transparan menghadap langit berbintang dengan kamar mandi dalam.' }
    ]
  }
];
