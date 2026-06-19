// ops-backend/services/authService.js
const bcrypt = require('bcryptjs');

exports.hashPassword = (password) => bcrypt.hash(password, 10);
exports.comparePassword = (password, hash) => bcrypt.compare(password, hash);