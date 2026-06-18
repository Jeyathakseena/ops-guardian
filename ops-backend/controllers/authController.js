// ops-backend/controllers/authController.js
const userQuery = require('../queries/userQuery');
const authService = require('../services/authService');

exports.signup = async (username, password) => {
  const exists = await userQuery.findOneByUsername(username);
  if (exists) throw new Error('Username already taken');

  const hashedPassword = await authService.hashPassword(password);
  await userQuery.create({ username, password: hashedPassword });

  return { ok: true, username };
};

exports.login = async (username, password) => {
  const user = await userQuery.findOneByUsername(username);
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await authService.comparePassword(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  return { ok: true, username: user.username };
};