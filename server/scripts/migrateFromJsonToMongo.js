require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const { User, Worker, Booking, Category, Feedback, Notification, Otp } = require('../src/models');

const DATA_DIR = path.join(__dirname, '..', 'data');

async function migrate() {
  console.log('====================================================');
  console.log('   GramSeva: Migrating Local Data to MongoDB Atlas  ');
  console.log('====================================================');

  await connectDB();

  const collections = [
    { file: 'categories.json', model: Category, name: 'Category' },
    { file: 'users.json', model: User, name: 'User' },
    { file: 'workers.json', model: Worker, name: 'Worker' },
    { file: 'bookings.json', model: Booking, name: 'Booking' },
    { file: 'feedback.json', model: Feedback, name: 'Feedback' },
    { file: 'notifications.json', model: Notification, name: 'Notification' }
  ];

  for (const item of collections) {
    const filePath = path.join(DATA_DIR, item.file);
    if (!fs.existsSync(filePath)) {
      console.log(`[Skip] ${item.file} not found.`);
      continue;
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (!raw.trim()) continue;
      const records = JSON.parse(raw);

      if (Array.isArray(records) && records.length > 0) {
        console.log(`[Migrating] Found ${records.length} records in ${item.file}...`);
        for (const doc of records) {
          // Upsert using id field
          if (doc.id) {
            await item.model.findOneAndUpdate(
              { id: doc.id },
              { $set: doc },
              { upsert: true, new: true }
            );
          } else if (doc.email) {
            await item.model.findOneAndUpdate(
              { email: doc.email },
              { $set: doc },
              { upsert: true, new: true }
            );
          }
        }
        console.log(`[Success] Migrated ${item.name} records into MongoDB.`);
      }
    } catch (err) {
      console.error(`[Error] Failed migrating ${item.file}:`, err.message);
    }
  }

  console.log('====================================================');
  console.log('✅ Migration completed successfully!');
  console.log('====================================================');
  await mongoose.connection.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
