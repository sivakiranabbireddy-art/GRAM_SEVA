require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function addAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const usersCol = db.collection('users');

    const email = 'valluriteja5@gmail.com'.toLowerCase().trim();
    const existing = await usersCol.findOne({ email });

    if (existing) {
      console.log('User already exists in MongoDB:', existing);
      await usersCol.updateOne(
        { email },
        { $set: { role: 'ADMIN', isVerified: true, isActive: true } }
      );
      console.log(`Successfully upgraded ${email} to ADMIN role.`);
    } else {
      const defaultPassword = 'Admin@12345';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      const newAdmin = {
        id: `usr_admin_${Date.now()}`,
        role: 'ADMIN',
        name: 'Teja Valluri',
        email: email,
        phone: '+91 98765 43210',
        passwordHash: passwordHash,
        locality: 'Central Administration',
        pincode: '500001',
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await usersCol.insertOne(newAdmin);
      console.log(`Successfully created new ADMIN user for ${email} with password: ${defaultPassword}`);
    }

    const admins = await usersCol.find({ role: 'ADMIN' }, { projection: { id: 1, name: 1, email: 1, role: 1 } }).toArray();
    console.log('All Registered Admins:', admins);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error adding admin:', err);
    process.exit(1);
  }
}

addAdmin();
