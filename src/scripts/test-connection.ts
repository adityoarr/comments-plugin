// Load environment variables dari .env.local
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

import { adminDb } from '../lib/firebase/admin';
import { auth, db } from '../lib/firebase/client';

async function testConnection() {
  console.log('🔌 Testing Firebase Connection...\n');

  try {
    // 1. Test Admin SDK Write
    console.log('1. Testing Admin SDK Write to Firestore...');
    const testRef = adminDb.collection('_system_test').doc('connection_check');
    await testRef.set({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
    console.log('   ✅ Admin Write Successful');

    // 2. Test Admin SDK Read
    console.log('2. Testing Admin SDK Read from Firestore...');
    const snapshot = await testRef.get();
    if (snapshot.exists) {
      console.log('   ✅ Admin Read Successful:', snapshot.data());
    } else {
      console.log('   ❌ Admin Read Failed: Document not found');
    }

    // 3. Test Client SDK Initialization
    console.log('3. Testing Client SDK Initialization...');
    if (auth && db) {
      console.log('   ✅ Client SDK Initialized Successfully');
      console.log(`    Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
    } else {
      console.log('   ❌ Client SDK Failed to Initialize');
    }

    // Cleanup test document
    await testRef.delete();
    console.log('\n🎉 All Firebase connection tests passed successfully!');
    
  } catch (error) {
    console.error('\n Firebase Connection Test Failed:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();