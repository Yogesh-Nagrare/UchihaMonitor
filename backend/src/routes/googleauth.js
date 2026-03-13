const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const {
  googleUserCallback,
  googleAdminCallback,
  googleAuthFailure,
  logout,
  getMe,
} = require('../controllers/googleAuth');
const { isAuthenticated, isAdmin } = require('../middleware/Auth');

// ── Initiate Google OAuth (User) ──────────────────────────────────────────────
// GET /auth/google/student
router.get(
  '/google/student',
  passport.authenticate('google-user', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// ── Google OAuth Callback (User) ──────────────────────────────────────────────
// GET /auth/google/student/callback
router.get(
  '/google/student/callback',
  passport.authenticate('google-user', {
    session: false,
    failureRedirect: '/auth/failure/student',
  }),
  googleUserCallback
);

// ── Initiate Google OAuth (Admin) ─────────────────────────────────────────────
// GET /auth/google/admin
router.get(
  '/google/admin',
  passport.authenticate('google-admin', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// ── Google OAuth Callback (Admin) ─────────────────────────────────────────────
// GET /auth/google/admin/callback
router.get(
  '/google/admin/callback',
  passport.authenticate('google-admin', {
    session: false,
    failureRedirect: '/auth/failure/admin',
  }),
  googleAdminCallback
);

// ── Auth Failure handlers ─────────────────────────────────────────────────────
router.get('/failure/student', googleAuthFailure);
router.get('/failure/admin', googleAuthFailure);

// ── Logout ────────────────────────────────────────────────────────────────────
// POST /auth/logout
router.post('/logout', logout);

// ── Get current user ──────────────────────────────────────────────────────────
// GET /auth/me  (protected)
router.get('/me', isAuthenticated, getMe);

// ── Admin-only: check admin session ──────────────────────────────────────────
// GET /auth/me/admin  (protected + admin)
router.get('/me/admin', isAuthenticated, isAdmin, getMe);

module.exports = router;