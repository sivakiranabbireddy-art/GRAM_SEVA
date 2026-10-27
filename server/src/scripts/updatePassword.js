require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const usersCol = db.collection('users');

    const email = 'valluriteja5@gmail.com'.toLowerCase().trim();
    const passwordHash = await bcrypt.hash('123456', 10);

    const result = await usersCol.updateOne(
      { email },
      { $set: { passwordHash, updatedAt: new Date() } }
    );

    console.log(`Password for ${email} updated successfully:`, result.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGE');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Failed to update password:', err);
    process.exit(1);
  }
}

updatePassword();
