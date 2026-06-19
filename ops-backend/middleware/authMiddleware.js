const jwtService = require('../services/jwtService');

exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwtService.verifyToken(token);
    req.user = decoded; // Attach decoded user to req
    next(); // Continue to controller
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};