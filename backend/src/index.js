require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const main = require('./config/db');
const redisClient = require('./config/redis');
const passport = require('./config/passport');

const googleAuthRoutes = require('./routes/googleauth');
const collectionRoutes = require('./routes/collection');
const requestRoutes = require('./routes/requestroute');
const environmentRoutes = require('./routes/environment');
const historyRoutes = require('./routes/Historyroute');
const proxyRoute = require('./routes/proxy')

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = isProduction ? process.env.FRONTEND_URL : process.env.CLIENT_URL;

console.log('🌍 Environment :', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');

app.set('trust proxy', 1);
app.use(cors({
origin: isProduction
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Health
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Mini Postman API is live!',
    environment: isProduction ? 'production' : 'development',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/proxy', proxyRoute)
app.use('/auth', googleAuthRoutes);
app.use('/collection', collectionRoutes);
app.use('/request', requestRoutes);
app.use('/environment', environmentRoutes);
app.use('/history', historyRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

let isConnected = false;
const initializeConnection = async () => {
  if (isConnected) return;
  try {
    await main();
    console.log('✅ MongoDB connected');
    if (!redisClient.isOpen) {
      try { await redisClient.connect(); }
      catch (e) { console.warn('⚠️  Redis skipped:', e.message); }
    }
    isConnected = true;
  } catch (err) {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1); // 👈 add this
  }
};

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  if (!isProduction) {
    console.log(`\n📋 All Routes:`);
    console.log(`  AUTH        GET  /auth/google/student`);
    console.log(`              GET  /auth/me`);
    console.log(`              POST /auth/logout`);
    console.log(`  COLLECTION  POST/GET/PUT/DELETE /collection`);
    console.log(`              PATCH /collection/:id/share|unshare`);
    console.log(`              GET   /collection/shared/:token`);
    console.log(`  REQUEST     POST/GET/PUT/DELETE /request`);
    console.log(`              GET   /request/collection/:collectionId`);
    console.log(`  ENVIRONMENT POST/GET/PUT/DELETE /environment`);
    console.log(`              GET   /environment/active`);
    console.log(`              PATCH /environment/:id/activate`);
    console.log(`  HISTORY     POST/GET/DELETE /history`);
    console.log(`              DELETE /history/clear/all\n`);
  }
});

initializeConnection();
module.exports = app;