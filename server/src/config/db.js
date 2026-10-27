const mongoose = require('mongoose');

let isConnected = false;
let connectionError = null;

/**
 * Connect to MongoDB with resilient retry and clear diagnostics
 */
async function connectDB(throwOnError = false) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gramseva';

  try {
    // Prevent redundant connections
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      connectionError = null;
      return mongoose.connection;
    }

    mongoose.set('strictQuery', false);

    // Mask password in logs
    const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
    console.log(`[MongoDB] Connecting to database (${maskedUri})...`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = true;
    connectionError = null;
    const host = conn.connection.host;
    const dbName = conn.connection.name;
    console.log(`[MongoDB] ✅ Successfully connected to MongoDB database "${dbName}" at ${host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection runtime error:`, err.message);
      isConnected = false;
      connectionError = err.message;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[MongoDB] Connection lost. Scheduling auto-reconnect in 5s...`);
      isConnected = false;
      scheduleReconnect();
    });

    return conn;
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.error('====================================================');
    console.error('⚠️ [MongoDB Connection Notice]:', err.message);
    console.error('----------------------------------------------------');
    console.error('💡 To connect your cloud MongoDB (Atlas):');
    console.error('   1. Open https://cloud.mongodb.com -> Network Access');
    console.error('   2. Add IP Address: 0.0.0.0/0 (or your current IP)');
    console.error('   3. Reconnection will automatically succeed in the background!');
    console.error('====================================================');

    scheduleReconnect();

    if (throwOnError) {
      throw err;
    }
    return null;
  }
}

let reconnectTimer = null;
function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (mongoose.connection.readyState !== 1) {
      try {
        const conn = await connectDB(false);
        if (conn && mongoose.connection.readyState === 1) {
          const { seedInitialData } = require('../services/seedService');
          await seedInitialData(false);
        }
      } catch (err) {
        // Will reschedule inside connectDB catch
      }
    }
  }, 5000);
}

function getConnectionStatus() {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    dbName: mongoose.connection.name || null,
    error: connectionError
  };
}

module.exports = {
  connectDB,
  getConnectionStatus
};
