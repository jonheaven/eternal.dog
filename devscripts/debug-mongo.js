// MongoDB Connection Debug Script
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('🔍 MongoDB Connection Debug');
console.log('==========================\n');

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

// Parse the connection string
console.log('📋 Connection String Analysis:');
console.log('─────────────────────────────');

const uriMatch = MONGO_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)?/);

if (uriMatch) {
  const username = uriMatch[1];
  const password = uriMatch[2];
  const cluster = uriMatch[3];
  const database = uriMatch[4] || '(missing)';
  
  console.log(`✅ Format: Valid`);
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password.substring(0, Math.min(4, password.length))}**** (${password.length} chars)`);
  console.log(`   Cluster: ${cluster}`);
  console.log(`   Database: ${database}`);
} else {
  console.log('❌ Format: Invalid');
  console.log('   Expected: mongodb+srv://username:password@cluster.mongodb.net/database?params');
}

console.log('\n🔧 Troubleshooting Steps:');
console.log('─────────────────────────');
console.log('1. MongoDB Atlas → Network Access:');
console.log('   → Click "Add IP Address"');
console.log('   → Add "0.0.0.0/0" (allows all IPs)');
console.log('   → Click "Confirm"');
console.log('   → Wait 1-2 minutes\n');

console.log('2. MongoDB Atlas → Database Access:');
console.log('   → Find user: ' + (uriMatch ? uriMatch[1] : 'your_username'));
console.log('   → Verify password matches');
console.log('   → Permissions: "Read and write to any database"\n');

console.log('3. Test connection directly from MongoDB Atlas:');
console.log('   → Database → Connect → Connect your application');
console.log('   → Copy the connection string');
console.log('   → Replace <password> with your actual password\n');

console.log('4. If password has special characters, URL-encode them:');
console.log('   @ → %40, # → %23, : → %3A, etc.\n');

// Test connection
console.log('🔌 Attempting connection...\n');

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // 5 second timeout
  })
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection Failed');
    console.error(`   Error: ${err.message}\n`);
    
    if (err.message.includes('bad auth')) {
      console.error('💡 This is an AUTHENTICATION error. Check:');
      console.error('   • Username/password are correct');
      console.error('   • Network Access is configured (0.0.0.0/0)');
      console.error('   • User exists in Database Access');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('ETIMEDOUT')) {
      console.error('💡 This is a NETWORK error. Check:');
      console.error('   • Internet connection');
      console.error('   • Cluster name is correct');
      console.error('   • Network Access allows your IP');
    }
    
    process.exit(1);
  });

