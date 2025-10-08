const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase
try {
  const serviceAccount = require('./config/serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  
  console.log('✅ Firebase initialized');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}

async function debugCollections() {
  try {
    const db = admin.firestore();
    
    console.log('🔍 FIRESTORE COLLECTIONS DEBUG\n');
    
    // 1. List all collections
    console.log('1️⃣ Listing all collections...');
    const collections = await db.listCollections();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`  📁 ${collection.id}`);
    });
    
    // 2. Check singlePlayerQuizzes collection specifically
    console.log('\n2️⃣ Checking singlePlayerQuizzes collection...');
    const singlePlayerSnapshot = await db.collection('singlePlayerQuizzes').get();
    console.log(`📊 singlePlayerQuizzes documents: ${singlePlayerSnapshot.size}`);
    
    if (singlePlayerSnapshot.size > 0) {
      console.log('Documents in singlePlayerQuizzes:');
      singlePlayerSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  📄 ${doc.id}:`);
        console.log(`    - Title: ${data.title}`);
        console.log(`    - User: ${data.userId}`);
        console.log(`    - Status: ${data.status}`);
        console.log(`    - Created: ${data.createdAt?.toDate?.() || 'Unknown'}`);
      });
    }
    
    // 3. Check regular quizzes collection for comparison
    console.log('\n3️⃣ Checking regular quizzes collection...');
    try {
      const quizzesSnapshot = await db.collection('quizzes').get();
      console.log(`📊 quizzes documents: ${quizzesSnapshot.size}`);
    } catch (error) {
      console.log('❌ No quizzes collection found or error accessing it');
    }
    
    // 4. Test creating a document
    console.log('\n4️⃣ Testing document creation...');
    const testDocRef = db.collection('singlePlayerQuizzes').doc('_test_' + Date.now());
    await testDocRef.set({
      test: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      message: 'This is a test document'
    });
    console.log('✅ Test document created successfully');
    
    // Clean up test document
    await testDocRef.delete();
    console.log('🗑️ Test document deleted');
    
    console.log('\n🎉 Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    process.exit(0);
  }
}

debugCollections();