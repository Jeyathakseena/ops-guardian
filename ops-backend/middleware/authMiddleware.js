const jwtService = require('../services/jwtService');

exports.authenticate = (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwtService.verifyToken(token);
    req.user = decoded; // Attach the authenticated user data to the request object
    next(); // Pass control to the controller function
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};