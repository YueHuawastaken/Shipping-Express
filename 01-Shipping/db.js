
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db("Shipping_db");
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    throw error;
  }
}

module.exports = { connectToMongoDB };
