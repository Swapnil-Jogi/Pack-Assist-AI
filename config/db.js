const mongoose = require('mongoose');

let isConnected = false;
let listenersAttached = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pack-assist-ai';

  if (!listenersAttached) {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('[MongoDB] Connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Error] Connection encountered an error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[MongoDB Warning] Disconnected from database cluster.');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('[MongoDB] Connection successfully re-established.');
    });

    listenersAttached = true;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: process.env.MONGODB_MAX_POOL_SIZE ? parseInt(process.env.MONGODB_MAX_POOL_SIZE, 10) : 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to prevent DNS resolution latency in containerized environments
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Notice] Could not connect to MongoDB at ${mongoURI.replace(/:([^:@]{3,})@/, ':****@')}: ${error.message}`);
    console.warn(`[MongoDB Notice] Fallback in-memory storage active for seamless local evaluation.`);
    return null;
  }
};

module.exports = {
  connectDB,
  getIsConnected: () => isConnected && mongoose.connection.readyState === 1,
  mongoose,
};
