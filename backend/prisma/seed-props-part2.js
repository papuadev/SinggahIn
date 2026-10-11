"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROPERTIES_PART_2 = void 0;
exports.PROPERTIES_PART_2 = [
    {
        tenantEmail: 'tenant2@example.com',
        categorySlug: 'villa',
        title: 'Villa Sunset Paradise Canggu',
        description: 'Villa kontemporer di kawasan favorit Canggu Bali, hanya beberapa menit ke Pantai Batu Bolong dan beach clubs.',
        address: 'Jl. Pantai Batu Bolong No. 55',
        city: 'Badung',
        latitude: -8.6534,
        longitude: 115.1321,
        facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Area Parkir Gratis', 'Smart TV & Hiburan'],
        rooms: [
            { name: 'Sunset Suite', basePrice: 1100000, capacity: 2, totalUnits: 4, description: 'Suite modern dengan balkon pribadi untuk menikmati matahari terbenam Canggu.' },
            { name: 'Royal Pool Villa', basePrice: 2200000, capacity: 4, totalUnits: 2, description: 'Unit villa lengkap dengan private swimming pool, sunken lounge, dan dapur mewah.' }
        ]
    },
    {
        tenantEmail: 'tenant2@example.com',
        categorySlug: 'hotel',
        title: 'Surabaya Heritage Business Hotel',
        description: 'Hotel bisnis terkemuka di pusat kota Surabaya dengan fasilitas ruang pertemuan lengkap dan akses mudah ke Tunjungan Plaza.',
        address: 'Jl. Pemuda No. 18-20',
        city: 'Surabaya',
        latitude: -7.2654,
        longitude: 112.7489,
        facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Resepsionis 24 Jam', 'Area Parkir Gratis', 'Keamanan 24 Jam'],
        rooms: [
            { name: 'Superior King', basePrice: 480000, capacity: 2, totalUnits: 8, description: 'Kamar nyaman bernuansa modern bisnis dengan meja kerja luas dan ranjang king size.' },
            { name: 'Deluxe Executive', basePrice: 720000, capacity: 2, totalUnits: 5, description: 'Kamar lantai atas dengan akses lounge eksekutif dan sarapan prasmanan gratis.' },
            { name: 'President Suite', basePrice: 1800000, capacity: 3, totalUnits: 2, description: 'Suite termewah dengan ruang makan privat, bathtub jacuzzi, dan panorama kota Surabaya.' }
        ]
    },
    {
        tenantEmail: 'tenant2@example.com',
        categorySlug: 'apartemen',
        title: 'Pakuwon Mall Luxury Residence',
        description: 'Apartemen terintegrasi langsung dengan Pakuwon Mall Surabaya Barat, menyajikan kenyamanan belanja dan kuliner di satu tempat.',
        address: 'Jl. Mayjend Jonosewojo No. 2',
        city: 'Surabaya',
        latitude: -7.2891,
        longitude: 112.6756,
        facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Area Parkir Gratis', 'Smart TV & Hiburan', 'Keamanan 24 Jam'],
        rooms: [
            { name: 'Studio Deluxe', basePrice: 400000, capacity: 2, totalUnits: 6, description: 'Studio cozy dengan pemandangan danau buatan dan akses langsung ke lift mall.' },
            { name: '2BR Corner Suite', basePrice: 750000, capacity: 4, totalUnits: 3, description: 'Unit sudut 2 kamar tidur dengan jendela kaca lebar dan pencahayaan alami melimpah.' }
        ]
    },
    {
        tenantEmail: 'tenant2@example.com',
        categorySlug: 'homestay',
        title: 'Pondok Asri Puncak Bogor',
        description: 'Homestay keluarga yang tenang di kawasan Puncak Bogor dengan udara sejuk pegunungan dan kebun teh hijau di sekelilingnya.',
        address: 'Jl. Raya Puncak KM 84',
        city: 'Bogor',
        latitude: -6.6987,
        longitude: 106.9456,
        facilities: ['WiFi Kecepatan Tinggi', 'Area Parkir Gratis', 'Dapur & Alat Makan', 'Smart TV & Hiburan'],
        rooms: [
            { name: 'Kamar Kebun Teh', basePrice: 320000, capacity: 2, totalUnits: 4, description: 'Kamar asri dengan jendela besar menghadap langsung ke hamparan kebun teh.' },
            { name: 'Family Villa 3 Kamar', basePrice: 1250000, capacity: 6, totalUnits: 2, description: 'Rumah singgah 3 kamar dengan ruang keluarga besar dan fasilitas BBQ outdoor.' }
        ]
    },
    {
        tenantEmail: 'tenant2@example.com',
        categorySlug: 'guesthouse',
        title: 'Simpang Lima Cozy Guesthouse',
        description: 'Akomodasi bersih, ramah, dan tenang berjarak tempuh 5 menit dari kawasan kuliner dan pusat kota Simpang Lima Semarang.',
        address: 'Jl. Ahmad Yani No. 142',
        city: 'Semarang',
        latitude: -6.9912,
        longitude: 110.4234,
        facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Resepsionis 24 Jam', 'Area Parkir Gratis'],
        rooms: [
            { name: 'Standard Single', basePrice: 150000, capacity: 1, totalUnits: 6, description: 'Kamar single hemat ber-AC dengan meja belajar dan koneksi internet cepat.' },
            { name: 'Superior Double', basePrice: 250000, capacity: 2, totalUnits: 5, description: 'Kamar double luas dengan kamar mandi dalam, air panas, dan TV kabel.' }
        ]
    },
    {
        tenantEmail: 'tenant2@example.com',
        categorySlug: 'hotel',
        title: 'Kuta Beachfront Boutique Hotel',
        description: 'Hotel tepi pantai di pesisir Pantai Kuta Bali dengan pemandangan deburan ombak dan sunset legendaris kelas dunia.',
        address: 'Jl. Pantai Kuta No. 8',
        city: 'Badung',
        latitude: -8.7212,
        longitude: 115.1698,
        facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Resepsionis 24 Jam', 'Area Parkir Gratis', 'Keamanan 24 Jam'],
        rooms: [
            { name: 'Ocean View Deluxe', basePrice: 750000, capacity: 2, totalUnits: 7, description: 'Kamar menghadap langsung ke samudera dengan suara deburan ombak menenangkan.' },
            { name: 'Sunset Suite Balcony', basePrice: 1150000, capacity: 2, totalUnits: 3, description: 'Suite eksklusif dengan balkon outdoor privat untuk menyaksikan panorama senja.' }
        ]
    },
    {
        tenantEmail: 'tenant2@example.com',
        categorySlug: 'apartemen',
        title: 'Setiabudi Skygarden Penthouse',
        description: 'Hunian vertikal mewah di Setiabudi Jakarta Selatan dengan taman gantung di lantai tinggi dan fasilitas olahraga modern.',
        address: 'Jl. Setiabudi Selatan Raya No. 2',
        city: 'Jakarta Selatan',
        latitude: -6.2134,
        longitude: 106.8289,
        facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Area Parkir Gratis', 'Smart TV & Hiburan', 'Keamanan 24 Jam'],
        rooms: [
            { name: '1BR Modern Minimalist', basePrice: 800000, capacity: 2, totalUnits: 4, description: 'Apartemen 1 kamar tidur bernuansa modern scandinavian dengan dapur lengkap.' },
            { name: '3BR Sky Penthouse', basePrice: 2500000, capacity: 6, totalUnits: 2, description: 'Penthouse megah dengan pemandangan 360 derajat kota metropolitan Jakarta.' }
        ]
    },
    {
        tenantEmail: 'tenant2@example.com',
        categorySlug: 'guesthouse',
        title: 'Solo Mangkunegaran Guesthouse',
        description: 'Penginapan tenang bernuansa budaya Jawa di dekat Pura Mangkunegaran, dekat pusat batik dan kuliner malam Solo.',
        address: 'Jl. Ronggowarsito No. 33',
        city: 'Solo',
        latitude: -7.5678,
        longitude: 110.8234,
        facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Area Parkir Gratis', 'Resepsionis 24 Jam'],
        rooms: [
            { name: 'Kamar Melati', basePrice: 180000, capacity: 2, totalUnits: 6, description: 'Kamar bersih berhias ornamen batik Solo dengan AC dan teh melati selamat datang.' },
            { name: 'Kamar Mawar Family', basePrice: 320000, capacity: 4, totalUnits: 3, description: 'Kamar keluarga dengan 2 tempat tidur queen dan teras menghadap halaman asri.' }
        ]
    },
    {
        tenantEmail: 'tenant2@example.com',
        categorySlug: 'others',
        title: 'Rinjani Foothill Bamboo Cabin',
        description: 'Kabin ramah lingkungan berbahan bambu alami di kaki Gunung Rinjani Lombok dengan panorama fajar yang memukau.',
        address: 'Desa Sembalun Lawang',
        city: 'Lombok',
        latitude: -8.3567,
        longitude: 116.5234,
        facilities: ['WiFi Kecepatan Tinggi', 'Area Parkir Gratis', 'Dapur & Alat Makan'],
        rooms: [
            { name: 'Bamboo Sunrise Cabin', basePrice: 350000, capacity: 2, totalUnits: 4, description: 'Kabin bambu unik dengan jendela panorama langsung menghadap perbukitan Sembalun.' },
            { name: 'Mountain View Treehouse', basePrice: 550000, capacity: 3, totalUnits: 2, description: 'Rumah pohon bertingkat berlatar belakang puncak megah Gunung Rinjani.' }
        ]
    },
    {
        tenantEmail: 'tenant2@example.com',
        categorySlug: 'villa',
        title: 'Villa Tirta Bening Ubud',
        description: 'Villa peristirahatan mewah di tepi sungai alami Ubud Bali, menawarkan kedamaian batin dan relaksasi total.',
        address: 'Jl. Suweta No. 88',
        city: 'Gianyar',
        latitude: -8.4987,
        longitude: 115.2678,
        facilities: ['WiFi Kecepatan Tinggi', 'Air Conditioning (AC)', 'Kolam Renang', 'Area Parkir Gratis', 'Dapur & Alat Makan', 'Smart TV & Hiburan'],
        rooms: [
            { name: 'Private Plunge Pool Villa', basePrice: 1650000, capacity: 2, totalUnits: 3, description: 'Villa privat intim dengan kolam rendam air alami dan gazebo bersantai.' },
            { name: 'Riverside Sanctuary Villa', basePrice: 2800000, capacity: 4, totalUnits: 2, description: 'Villa eksklusif dua kamar tidur tepat di tepi sungai dengan dek berjemur pribadi.' }
        ]
    }
];
