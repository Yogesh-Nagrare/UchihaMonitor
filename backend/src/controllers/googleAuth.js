const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

// ── Helpers ───────────────────────────────────────────────────────────────────

const isDev = () => process.env.NODE_ENV !== 'production';

const getFrontendUrl = () => {
  return isDev() ? process.env.CLIENT_URL : process.env.FRONTEND_URL;
};

const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, emailId: user.emailId, role: user.role },
    process.env.JWT_KEY,
    { expiresIn: '7d' }
  );
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: !isDev(),
    sameSite: isDev() ? 'lax' : 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

const prepareUserData = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  emailId: user.emailId,
  role: user.role,
  profilePic: user.profilePic,
});

// ── Google User Callback ──────────────────────────────────────────────────────

const googleUserCallback = async (req, res) => {
  try {
    if (!req.user) {
      console.log('❌ No user in request after Google OAuth');
      return res.redirect(`${getFrontendUrl()}/login?error=auth_failed`);
    }

    const token = generateToken(req.user);
    setTokenCookie(res, token);
    console.log('✅ Google user login success:', req.user.emailId);

    // Always redirect to frontend — cookie is already set
    // Frontend will call /auth/me to get user data from cookie
    return res.redirect(`${getFrontendUrl()}/dashboard`);
  } catch (err) {
    console.error('❌ googleUserCallback error:', err);
    return res.redirect(`${getFrontendUrl()}/login?error=server_error`);
  }
};

// ── Google Admin Callback ─────────────────────────────────────────────────────

const googleAdminCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${getFrontendUrl()}/login?error=auth_failed`);
    }

    if (req.user.role !== 'admin') {
      return res.redirect(`${getFrontendUrl()}/login?error=unauthorized`);
    }

    const token = generateToken(req.user);
    setTokenCookie(res, token);
    console.log('✅ Google admin login success:', req.user.emailId);

    return res.redirect(`${getFrontendUrl()}/dashboard`);
  } catch (err) {
    console.error('❌ googleAdminCallback error:', err);
    return res.redirect(`${getFrontendUrl()}/login?error=server_error`);
  }
};

// ── Auth Failure ──────────────────────────────────────────────────────────────

const googleAuthFailure = (req, res) => {
  const isAdmin = req.originalUrl.includes('admin');
  console.log('❌ Google auth failure for:', req.originalUrl);
  const path = isAdmin ? '/login?error=admin_auth_failed' : '/login?error=google_auth_failed';
  return res.redirect(`${getFrontendUrl()}${path}`);
};

// ── Logout (blacklist token in Redis) ────────────────────────────────────────

const logout = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (token && redisClient.isOpen) {
      const decoded = jwt.decode(token);
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redisClient.setEx(`bl:${token}`, ttl, '1');
          console.log(`🚫 Token blacklisted for ${ttl}s`);
        }
      }
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: isDev() ? 'lax' : 'none',
      path: '/',
    });

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('❌ Logout error:', err);
    return res.status(500).json({ success: false, message: 'Logout failed.' });
  }
};

// ── Get current user ──────────────────────────────────────────────────────────

const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    user: prepareUserData(req.user),
  });
};

module.exports = {
  googleUserCallback,
  googleAdminCallback,
  googleAuthFailure,
  logout,
  getMe,
};