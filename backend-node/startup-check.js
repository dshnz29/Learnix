const axios = require('axios');
const admin = require('firebase-admin');

async function checkStartup() {
  console.log('🚀 Starting Learnix Backend Verification...\n');
  
  // 1. Check if server is running
  try {
    console.log('1️⃣ Testing server connection...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is running:', response.data);
  } catch (error) {
    console.error('❌ Server is not running. Please start with: npm start');
    console.error('   Error:', error.message);
    return;
  }
  
  // 2. Check Firebase connection
  try {
    console.log('\n2️⃣ Testing Firebase connection...');
    const db = admin.firestore();
    await db.collection('_test').limit(1).get();
    console.log('✅ Firebase connected successfully');
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    console.error('   Check your serviceAccountKey.json and .env file');
  }
  
  // 3. Test API endpoints
  try {
    console.log('\n3️⃣ Testing API endpoints...');
    
    // Test single player create (should fail with 400 - but means route exists)
    try {
      await axios.post('http://localhost:5000/api/singleplayer/create', {});
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Single player create endpoint exists');
      } else {
        console.log('❌ Single player create endpoint error:', err.message);
      }
    }
    
    // Test stats endpoint (should fail with user not found, but route exists)
    try {
      await axios.get('http://localhost:5000/api/singleplayer/stats/test-user');
    } catch (err) {
      if (err.response?.status === 500) {
        console.log('✅ Single player stats endpoint exists');
      } else {
        console.log('❌ Single player stats endpoint error:', err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ API endpoint test failed:', error.message);
  }
  
  console.log('\n🎉 Startup check complete!');
  console.log('💡 If everything shows ✅, your backend is ready to use.');
}

// Initialize Firebase for testing
try {
  const serviceAccount = require('./config/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
}

checkStartup();