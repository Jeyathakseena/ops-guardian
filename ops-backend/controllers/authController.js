// ops-backend/controllers/authController.js
const userQuery = require('../queries/userQuery');
const authService = require('../services/authService');

exports.signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const exists = await userQuery.findOneByUsername(username);
    if (exists) return res.status(400).json({ error: 'Username already taken' });

    const hashedPassword = await authService.hashPassword(password);
    await userQuery.create({ username, password: hashedPassword });

    res.json({ ok: true, username });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userQuery.findOneByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await authService.comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ ok: true, username: user.username });
  } catch (err) {
    next(err);
  }
};