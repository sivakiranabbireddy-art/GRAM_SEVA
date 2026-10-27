require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { seedInitialData } = require('./src/services/seedService');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Attempt connection to MongoDB
    const conn = await connectDB(false);

    // 2. Seed initial demo data into MongoDB if connected and collections are empty
    if (conn && mongoose.connection.readyState === 1) {
      await seedInitialData(false);
    } else {
      console.log('ℹ️ Server starting in setup mode. Once your MONGODB_URI is configured in server/.env, database operations will become active.');
    }

    // 3. Start Express server
    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`  🌾 GramSeva Backend API running on port ${PORT}`);
      console.log(`  🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`  🛡️ Admin Email: ${process.env.ADMIN_EMAIL || 'admin@gramseva.in'}`);
      if (mongoose.connection.readyState === 1) {
        console.log(`  🍃 Database: MongoDB (${mongoose.connection.name} @ ${mongoose.connection.host})`);
      } else {
        console.log(`  ⚠️ Database: Disconnected (Configure MONGODB_URI in server/.env)`);
      }
      console.log('====================================================');
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Closing server gracefully...`);
      server.close(async () => {
        try {
          if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('[Server] MongoDB connection closed.');
          }
        } catch (err) {
          console.error('[Server] Error closing MongoDB connection:', err);
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
