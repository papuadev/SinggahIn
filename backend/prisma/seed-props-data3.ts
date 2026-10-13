import { SeedPropertyDef } from './seed-types';

export const PROPERTIES_DATA_3: SeedPropertyDef[] = [
  {
    tenantEmail: 'nilm.atelier@gmail.com',
    categorySlug: 'apartemen',
    title: 'PIK Water View Suites',
    description: 'Apartemen tepi laut modern di Pantai Indah Kapuk Jakarta Utara, dekat pusat kuliner hits dan pantai pasir putih.',
    address: 'Jl. Marina Indah Raya No. 1',
    city: 'Jakarta Utara',
    latitude: -6.11234,
    longitude: 106.74567,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Pusat Kebugaran (Gym)', 'Kolam Renang'],
    rooms: [
      { name: 'Bayview Studio', basePrice: 600000, capacity: 2, totalUnits: 4, description: 'Studio modern dengan balkon menghadap perairan teluk Jakarta.' },
      { name: 'Executive Bay', basePrice: 950000, capacity: 3, totalUnits: 2, description: 'Unit sudut dengan pemandangan marina dan interior marmer.' }
    ]
  },
  {
    tenantEmail: 'nilm.atelier@gmail.com',
    categorySlug: 'hotel',
    title: 'Nusa Dua Royal Palms',
    description: 'Resort hotel mewah bintang lima di kawasan elit Nusa Dua Bali dengan taman tropis dan akses pantai privat eksklusif.',
    address: 'Kawasan Pariwisata Nusa Dua BTDC',
    city: 'Bali',
    latitude: -8.79876,
    longitude: 115.22345,
    facilities: ['WiFi Kecepatan Tinggi', 'Kolam Renang', 'Air Conditioning (AC)', 'Resepsionis 24 Jam', 'Pusat Kebugaran (Gym)'],
    rooms: [
      { name: 'Palms Superior', basePrice: 800000, capacity: 2, totalUnits: 6, description: 'Kamar elegan dengan ranjang empuk dan balkon pemandangan palem.' },
      { name: 'Royal Ocean King', basePrice: 1400000, capacity: 2, totalUnits: 4, description: 'Kamar mewah dengan king bed dan panorama laut biru Nusa Dua.' },
      { name: 'President Suite', basePrice: 2800000, capacity: 4, totalUnits: 2, description: 'Suite kepresidenan dengan jacuzzi pribadi dan ruang perjamuan.' }
    ]
  },
  {
    tenantEmail: 'nilm.atelier@gmail.com',
    categorySlug: 'guesthouse',
    title: 'Riau Heritage House',
    description: 'Guesthouse homey di Jalan Riau Bandung, pusat factory outlet dan deretan restoran legendaris kota kembang.',
    address: 'Jl. LLRE Martadinata No. 76',
    city: 'Bandung',
    latitude: -6.90678,
    longitude: 107.6189,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Area Parkir Gratis'],
    rooms: [
      { name: 'Vintage Twin', basePrice: 320000, capacity: 2, totalUnits: 4, description: 'Kamar dua ranjang dengan lantai tegel klasik dan suasana sejuk.' },
      { name: 'Vintage King', basePrice: 420000, capacity: 2, totalUnits: 3, description: 'Kamar dengan ranjang king berkayu jati dan kamar mandi bersih.' }
    ]
  },
  {
    tenantEmail: 'nilm.atelier@gmail.com',
    categorySlug: 'hotel',
    title: 'Kuta Central Pod & Room',
    description: 'Akomodasi berjiwa muda di Kuta Bali, hanya 10 menit jalan kaki ke Pantai Kuta dan pusat perbelanjaan Beachwalk.',
    address: 'Jl. Legian No. 112',
    city: 'Bali',
    latitude: -8.71234,
    longitude: 115.17234,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Resepsionis 24 Jam'],
    rooms: [
      { name: 'Pod Private Rm', basePrice: 250000, capacity: 1, totalUnits: 8, description: 'Kamar pod privat berdesain futuristik, hemat dan nyaman.' },
      { name: 'Standard Double', basePrice: 400000, capacity: 2, totalUnits: 5, description: 'Kamar double modern dengan fasilitas lengkap dan AC dingin.' }
    ]
  },
  {
    tenantEmail: 'nilm.atelier@gmail.com',
    categorySlug: 'apartemen',
    title: 'Semarang Simpang Lima Apt',
    description: 'Apartemen terintegrasi di kawasan Simpang Lima Semarang, pusat kuliner malam dan jantung aktivitas ibu kota Jawa Tengah.',
    address: 'Jl. Ahmad Yani No. 145',
    city: 'Semarang',
    latitude: -6.99123,
    longitude: 110.42345,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Pusat Kebugaran (Gym)'],
    rooms: [
      { name: 'Simpang Studio', basePrice: 350000, capacity: 2, totalUnits: 6, description: 'Studio praktis dan bersih dengan city view Simpang Lima.' },
      { name: 'Family Two Bed', basePrice: 600000, capacity: 4, totalUnits: 3, description: 'Unit keluarga dengan 2 kamar tidur dan dapur memasak.' }
    ]
  },
  {
    tenantEmail: 'nilm.atelier@gmail.com',
    categorySlug: 'villa',
    title: 'Kuta Lombok Sunset Retreat',
    description: 'Villa tropis di perbukitan Kuta Lombok Selatan dengan pemandangan Samudra Hindia dan sirkuit Mandalika.',
    address: 'Jl. Pariwisata Pantai Kuta No. 8',
    city: 'Lombok',
    latitude: -8.89234,
    longitude: 116.2789,
    facilities: ['WiFi Kecepatan Tinggi', 'Kolam Renang', 'Air Conditioning (AC)', 'Balkon & Teras'],
    rooms: [
      { name: 'Sunset Cottage', basePrice: 550000, capacity: 2, totalUnits: 4, description: 'Cottage eksotis dengan teras menghadap matahari terbenam.' },
      { name: 'Hilltop Villa', basePrice: 1050000, capacity: 4, totalUnits: 2, description: 'Villa di puncak bukit dengan kolam renang infinity privat.' }
    ]
  },
  {
    tenantEmail: 'nilm.atelier@gmail.com',
    categorySlug: 'guesthouse',
    title: 'Bogor Botanical Stay',
    description: 'Guesthouse asri tepat di seberang Kebun Raya Bogor, udara sejuk dengan pepohonan rindang dan suasana tenang.',
    address: 'Jl. Pajajaran No. 28',
    city: 'Bogor',
    latitude: -6.59876,
    longitude: 106.80432,
    facilities: ['WiFi Kecepatan Tinggi', 'Area Parkir Gratis', 'Dapur & Alat Makan'],
    rooms: [
      { name: 'Botanical Queen', basePrice: 300000, capacity: 2, totalUnits: 5, description: 'Kamar queen bersih dengan teras menghadap kebun hijau.' },
      { name: 'Family Green Rm', basePrice: 520000, capacity: 4, totalUnits: 2, description: 'Kamar luas untuk keluarga dengan ranjang tambahan dan sofa.' }
    ]
  },
  {
    tenantEmail: 'nilm.atelier@gmail.com',
    categorySlug: 'hotel',
    title: 'Medan City Central Hotel',
    description: 'Hotel bisnis modern di pusat kota Medan, dekat Lapangan Merdeka dan stasiun kereta bandara Railink.',
    address: 'Jl. Balai Kota No. 1',
    city: 'Medan',
    latitude: 3.59123,
    longitude: 98.67543,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Resepsionis 24 Jam', 'Area Parkir Gratis'],
    rooms: [
      { name: 'Deluxe Twin', basePrice: 420000, capacity: 2, totalUnits: 8, description: 'Kamar dua ranjang dengan shower air panas dan meja kerja.' },
      { name: 'Executive King', basePrice: 680000, capacity: 2, totalUnits: 4, description: 'Kamar ranjang king dengan akses lounge dan sarapan gratis.' }
    ]
  },
  {
    tenantEmail: 'nilm.atelier@gmail.com',
    categorySlug: 'apartemen',
    title: 'Ciumbuleuit Heights Apt',
    description: 'Apartemen dataran tinggi di Ciumbuleuit Bandung utara, udara dingin dengan pemandangan bukit Punclut yang indah.',
    address: 'Jl. Ciumbuleuit No. 125',
    city: 'Bandung',
    latitude: -6.86543,
    longitude: 107.60432,
    facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Pusat Kebugaran (Gym)'],
    rooms: [
      { name: 'Mountain Studio', basePrice: 390000, capacity: 2, totalUnits: 5, description: 'Studio nyaman di lantai tinggi dengan pemandangan bukit.' },
      { name: 'Two Bedroom Rm', basePrice: 700000, capacity: 4, totalUnits: 2, description: 'Unit dua kamar cocok untuk liburan keluarga atau teman.' }
    ]
  },
  {
    tenantEmail: 'nilm.atelier@gmail.com',
    categorySlug: 'villa',
    title: 'Kaliurang Pine Lodge',
    description: 'Lodge kayu pinus di kaki Gunung Merapi Kaliurang, sejuk berkabut dengan suara alam yang menenangkan pikiran.',
    address: 'Jl. Boyong KM 25 Kaliurang',
    city: 'Yogyakarta',
    latitude: -7.60123,
    longitude: 110.4289,
    facilities: ['WiFi Kecepatan Tinggi', 'Area Parkir Gratis', 'Dapur & Alat Makan'],
    rooms: [
      { name: 'Pine Cabin', basePrice: 480000, capacity: 2, totalUnits: 3, description: 'Kabin kayu nyaman dengan perapian dan pemanas air.' },
      { name: 'Family Chalet', basePrice: 900000, capacity: 4, totalUnits: 2, description: 'Chalet kayu besar dengan ruang tamu dan halaman rumput.' }
    ]
  }
];
