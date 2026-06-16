// ops-backend/queries/userQuery.js
const User = require('../models/User');

exports.findOneByUsername = (username) => User.findOne({ username });
exports.create = (user) => User.create(user);