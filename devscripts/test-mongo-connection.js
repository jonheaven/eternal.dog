// Quick MongoDB connection test
// Run with: node test-mongo-connection.js

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

console.log('🔍 Testing MongoDB connection...');
console.log('Connection string:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password
console.log('');

mongoose
  .connect(uri)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    console.log('✅ Database:', mongoose.connection.db.databaseName);
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('');
    console.error('Common issues:');
    console.error('1. Check Network Access in MongoDB Atlas (add 0.0.0.0/0 for development)');
    console.error('2. Verify username and password are correct');
    console.error('3. Make sure the database user exists and has proper permissions');
    process.exit(1);
  });

