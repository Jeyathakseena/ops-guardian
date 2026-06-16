// ops-backend/config/db.js
const mongoose = require('mongoose');

async function connectDB(mongoUrl) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await mongoose.connect(mongoUrl);
      console.log('[Backend] MongoDB connected');
      return;
    } catch {
      console.log(`[Backend] MongoDB attempt ${attempt}/5 — retrying in 5s...`);
      if (attempt === 5) throw new Error('DB connection failed');
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

module.exports = connectDB;