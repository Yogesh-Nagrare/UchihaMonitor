const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const isProduction = process.env.NODE_ENV === 'production'

// ── Verify JWT from cookie ────────────────────────────────────────────────────
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Check if token has been blacklisted (logged out)
    if (redisClient.isOpen) {
      const isBlacklisted = await redisClient.get(`bl:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({ message: 'Token invalidated. Please login again.' });
      }
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(decoded._id).select('-__v');

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    req.user = user;
    req.token = token;
    req.tokenExp = decoded.exp;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

// ── Cookie options ────────────────────────────────────────────────────────────
// Production: secure + sameSite none (cross-origin: Vercel → Render)
// Dev:        lax + not secure (same-origin localhost)
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
}

const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
}

// ── Verify admin role ─────────────────────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden. Admin access required.' });
  }
  next();
};

module.exports = { isAuthenticated, isAdmin, cookieOptions, clearCookieOptions };