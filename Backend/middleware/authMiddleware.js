const jwt = require('jsonwebtoken');
const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

module.exports = { protect };
