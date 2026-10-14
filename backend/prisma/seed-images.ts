import { v2 as cloudinary } from 'cloudinary';

export interface SeedImageResult {
  secureUrl: string;
  publicId: string;
}

const PROPERTY_URLS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1000&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1000&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1000&q=80',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1000&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=80',
  'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1000&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&q=80',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&q=80',
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1000&q=80',
  'https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=1000&q=80',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1000&q=80',
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1000&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1000&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1000&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1000&q=80',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1000&q=80',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1000&q=80'
];

const ROOM_URLS = [
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&q=80',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1000&q=80',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1000&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1000&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&q=80',
  'https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=1000&q=80',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1000&q=80',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1000&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&q=80',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1000&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1000&q=80',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1000&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1000&q=80',
  'https://images.unsplash.com/photo-1590490359854-dfba19688d70?w=1000&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1000&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&q=80',
  'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1000&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&q=80',
  'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=1000&q=80',
  'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1000&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80',
  'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=1000&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&q=80',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1000&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&q=80'
];

function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

async function uploadSingleImage(url: string, publicId: string): Promise<SeedImageResult> {
  const res = await cloudinary.uploader.upload(url, {
    public_id: publicId,
    overwrite: false,
    format: 'webp'
  });
  return { secureUrl: res.secure_url, publicId: res.public_id };
}

async function uploadBatch(urls: string[], prefix: string): Promise<SeedImageResult[]> {
  const results: SeedImageResult[] = [];
  const chunkSize = 5;
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    const promises = chunk.map((url, idx) => {
      const padIndex = String(i + idx + 1).padStart(2, '0');
      return uploadSingleImage(url, `singgahin/seed/${prefix}_${padIndex}`);
    });
    const batch = await Promise.all(promises);
    results.push(...batch);
  }
  return results;
}

function getPresetSeedImages(count: number, prefix: string): SeedImageResult[] {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'jtxmsxhl';
  return Array.from({ length: count }, (_, idx) => {
    const padIndex = String(idx + 1).padStart(2, '0');
    const publicId = `singgahin/seed/${prefix}_${padIndex}`;
    return {
      publicId,
      secureUrl: `https://res.cloudinary.com/${cloudName}/image/upload/singgahin/seed/${prefix}_${padIndex}.webp`
    };
  });
}

async function uploadFreshImages(): Promise<{ properties: SeedImageResult[]; rooms: SeedImageResult[] }> {
  initCloudinary();
  console.log('Syncing seed images to Cloudinary account (forced)...');
  const properties = await uploadBatch(PROPERTY_URLS, 'prop');
  const rooms = await uploadBatch(ROOM_URLS, 'room');
  console.log(`Cloudinary sync complete: ${properties.length} properties, ${rooms.length} rooms.`);
  return { properties, rooms };
}

export async function ensureSeedImages(): Promise<{
  properties: SeedImageResult[];
  rooms: SeedImageResult[];
}> {
  if (process.env.FORCE_CLOUDINARY_SEED_UPLOAD === 'true') {
    return uploadFreshImages();
  }
  console.log('Using pre-existing Cloudinary seed images...');
  const properties = getPresetSeedImages(PROPERTY_URLS.length, 'prop');
  const rooms = getPresetSeedImages(ROOM_URLS.length, 'room');
  console.log(`Loaded ${properties.length} property images and ${rooms.length} room images.`);
  return { properties, rooms };
}

