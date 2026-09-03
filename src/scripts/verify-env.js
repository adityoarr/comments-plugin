const fs = require('fs');
const path = require('path');

// Cari .env.local di root project (naik 2 level dari src/scripts)
const envPath = path.join(__dirname, '..', '..', '.env.local');

console.log(' Mencari file .env.local di:', envPath);
console.log('');

if (!fs.existsSync(envPath)) {
  console.error('❌ File .env.local TIDAK DITEMUKAN!');
  console.error(' Lokasi yang dicari:', envPath);
  console.error('');
  console.error(' Solusi:');
  console.error('   1. Buat file .env.local di root folder project');
  console.error('   2. Isi dengan konfigurasi Firebase Anda');
  console.error('   3. Lihat .env.example untuk template');
  process.exit(1);
}

// Baca isi file
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse manual (karena dotenv mungkin belum terinstall)
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...valueParts] = trimmed.split('=');
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

console.log(' Memeriksa environment variables...\n');

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY'
];

let allGood = true;
let hasEmptyValues = false;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  
  if (!value) {
    console.error(`❌ ${varName} = (KOSONG/TIDAK ADA)`);
    allGood = false;
    hasEmptyValues = true;
  } else if (varName === 'FIREBASE_ADMIN_PRIVATE_KEY') {
    if (value.length < 50) {
      console.error(` ${varName} = (TERLALU PENDEK - mungkin tidak lengkap)`);
      allGood = false;
    } else if (!value.includes('-----BEGIN PRIVATE KEY-----')) {
      console.error(`❌ ${varName} = (FORMAT SALAH - harus dimulai dengan "-----BEGIN PRIVATE KEY-----")`);
      allGood = false;
    } else {
      console.log(`✅ ${varName} = OK (${value.length} karakter)`);
    }
  } else {
    console.log(`✅ ${varName} = OK`);
  }
});

console.log('');

if (hasEmptyValues) {
  console.error('❌ Ada environment variable yang kosong!');
  console.error('💡 Silakan isi semua variabel di file .env.local');
  console.error('');
  console.error('📋 Cara mendapatkan nilai-nilai tersebut:');
  console.error('   1. Buka https://console.firebase.google.com/');
  console.error('   2. Pilih project Anda');
  console.error('   3. Klik ikon gear (Settings) → Project settings');
  console.error('   4. Scroll ke bawah ke bagian "Your apps"');
  console.error('   5. Klik ikon web (</>) untuk melihat config');
  console.error('   6. Untuk Admin SDK: Tab "Service accounts" → Generate new private key');
  process.exit(1);
} else if (allGood) {
  console.log('✅ SEMUA environment variables sudah terisi!');
  console.log('');
  console.log(' Langkah selanjutnya:');
  console.log('   Jalankan: npx tsx src/scripts/test-connection.ts');
} else {
  console.error('❌ Ada masalah dengan format environment variables');
  process.exit(1);
}