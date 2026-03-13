const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

// ============================================
// GOOGLE STRATEGY FOR REGULAR USERS
// ============================================
passport.use(
  'google-user',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.STUDENT_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        console.log('🔍 Google User Login Attempt:', email);

        // Check if user already exists (by googleId OR email)
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { emailId: email }],
        });

        if (user) {
          console.log('✅ Existing user found');

          // Link Google account if user registered with email before
          if (!user.googleId) {
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.isEmailVerified = true;
            user.profilePic = user.profilePic || profile.photos[0]?.value;
          }

          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Create new user
        console.log('➕ Creating new Google user');
        user = new User({
          googleId: profile.id,
          firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
          lastName: profile.name?.familyName || '',
          emailId: email,
          authProvider: 'google',
          role: 'user',
          isEmailVerified: true,
          profilePic: profile.photos[0]?.value || null,
          lastLogin: new Date(),
        });

        await user.save();
        console.log('✅ New user created:', email);
        return done(null, user);
      } catch (err) {
        console.error('❌ Google User Auth Error:', err);
        return done(err, null);
      }
    }
  )
);

// ============================================
// GOOGLE STRATEGY FOR ADMINS
// ============================================
passport.use(
  'google-admin',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.ADMIN_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        console.log('🔍 Google Admin Login Attempt:', email);

        // Optional: restrict to specific email domains
        const allowedDomains = process.env.ADMIN_EMAIL_DOMAINS?.split(',') || [];
        if (allowedDomains.length > 0) {
          const domain = email.split('@')[1];
          if (!allowedDomains.includes(domain)) {
            console.log(`❌ Unauthorized domain: ${domain}`);
            return done(null, false, { message: 'Only authorized admin emails allowed' });
          }
        }

        // Admin must already exist in the DB — no auto-creation
        let admin = await User.findOne({
          $or: [{ googleId: profile.id }, { emailId: email }],
        });

        if (!admin) {
          console.log(`❌ Admin account not found for: ${email}`);
          return done(null, false, {
            message: 'Admin account not found. Contact system administrator.',
          });
        }

        if (admin.role !== 'admin') {
          console.log(`❌ Non-admin attempted admin login: ${email}`);
          return done(null, false, { message: 'Unauthorized: Admin access required' });
        }

        // Link Google if not already linked
        if (!admin.googleId) {
          admin.googleId = profile.id;
          admin.authProvider = 'google';
          admin.isEmailVerified = true;
          admin.profilePic = admin.profilePic || profile.photos[0]?.value;
        }

        admin.lastLogin = new Date();
        await admin.save();

        console.log('✅ Admin authenticated:', email);
        return done(null, admin);
      } catch (err) {
        console.error('❌ Google Admin Auth Error:', err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;