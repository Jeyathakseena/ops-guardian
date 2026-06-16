// ops-backend/server.js
const config = require('./config/env');
const connectDB = require('./config/db');

connectDB(config.MONGO_URL)
  .then(() => {
    const app = require('./app');
    app.listen(config.PORT, () => {
      console.log(`[Backend] Listening on port ${config.PORT}`);
    });
  })
  .catch(err => {
    console.error('[Backend] Could not connect to DB. Exiting.');
    console.error(err);
    process.exit(1);
  });