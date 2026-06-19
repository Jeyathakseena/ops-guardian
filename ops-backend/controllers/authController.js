// ops-backend/controllers/authController.js
const userQuery = require('../queries/userQuery');
const authService = require('../services/authService');
const jwtService = require('../services/jwtService');


exports.signup = async (username, password) => {
  const exists = await userQuery.findOneByUsername(username);
  if (exists) throw new Error('Username already taken');

  const hashedPassword = await authService.hashPassword(password);
  await userQuery.create({ username, password: hashedPassword });

  // Issue token immediately on successful registration
  const token = jwtService.generateToken(username);
  return { ok: true, username, token };
};


exports.login = async (username, password) => {
  const user = await userQuery.findOneByUsername(username);
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await authService.comparePassword(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwtService.generateToken(username);
  return { ok: true, username: user.username, token };
};