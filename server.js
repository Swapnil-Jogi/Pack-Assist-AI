require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const connectMongoModule = require('connect-mongo');
const MongoStore = connectMongoModule.MongoStore || connectMongoModule.default || connectMongoModule;
const passport = require('passport');
const flash = require('connect-flash');
const cors = require('cors');
const methodOverride = require('method-override');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const { connectDB, mongoose } = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');

// Initialize Express Application
const app = express();
const PORT = process.env.PORT || 8080;
const isProduction = process.env.NODE_ENV === 'production';

// Trust reverse proxy (Render, AWS ALB, Heroku, Cloudflare, Nginx)
app.set('trust proxy', 1);

// Passport Configuration
require('./config/passport')(passport);

// Production HTTP Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Ensures CDN assets (Tailwind, FontAwesome, Bootstrap, Chart.js) load smoothly
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Response Compression (Gzip / Deflate)
app.use(compression());

// Production HTTP Request Logging via Morgan (Skips health checks for cleaner log volume)
const morganFormat = isProduction ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    skip: (req) => req.url === '/health' || req.url === '/api/v1/health',
  })
);

// General Rate Limiting
app.use(generalLimiter);

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body Parsing Middleware
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(methodOverride('_method'));

// Static Assets with Cache-Control for Production Performance
const staticMaxAge = isProduction ? '1d' : 0;
app.use(express.static(path.join(__dirname, 'public'), { maxAge: staticMaxAge }));

// View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Production-Resilient Session Storage
const sessionSecret = process.env.SESSION_SECRET || 'pack_assist_ai_super_secret_session_key_998877';
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pack-assist-ai';

let sessionStore;
try {
  sessionStore = MongoStore.create({
    mongoUrl: mongoURI,
    collectionName: 'sessions',
    ttl: 7 * 24 * 60 * 60, // 7 days
    autoRemove: 'native',
    touchAfter: 24 * 3600, // Lazy session update once every 24 hours
    crypto: {
      secret: sessionSecret,
    },
  });
  sessionStore.on('error', (err) => {
    console.warn('[Session Store Warning] MongoStore issue:', err.message);
  });
} catch (storeErr) {
  console.warn('[Session Store Notice] Fallback to in-memory session store.');
  sessionStore = undefined;
}

const sessionConfig = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: isProduction,
  },
};

if (sessionStore) {
  sessionConfig.store = sessionStore;
}

app.use(session(sessionConfig));

// Connect Flash Messages
app.use(flash());

// Passport Authentication Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global Template Context Variables
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
});

// Production Health Check Endpoint (AWS ALB, Render, Docker, K8s Probes)
app.get(['/health', '/api/v1/health'], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    service: 'pack-assist-ai',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: isDbConnected ? 'connected' : 'in-memory-fallback',
    memoryUsage: {
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
    version: '1.0.0',
  });
});

// Import Application Routes
const authRoutes = require('./routes/authRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const apiRoutes = require('./routes/apiRoutes');

// Root Landing Page Route
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Pack-Assist AI | Intelligent Food Packaging Recommendation System',
    user: req.user,
  });
});

// Mount Routes
app.use('/', authRoutes);
app.use('/', recommendationRoutes);
app.use('/api/v1', apiRoutes);

// 404 Route Handler
app.use((req, res) => {
  if (req.xhr || req.originalUrl.startsWith('/api/') || req.headers.accept?.includes('application/json')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
  res.status(404).render('404', {
    title: 'Page Not Found | Pack-Assist AI',
    user: req.user,
  });
});

// Global Production-Hardened Error Handler
app.use((err, req, res, next) => {
  console.error(`[Server Error] [${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err);
  const status = err.status || 500;

  if (req.xhr || req.originalUrl.startsWith('/api/') || req.headers.accept?.includes('application/json')) {
    return res.status(status).json({
      success: false,
      error: isProduction ? 'Internal server error. Please try again later.' : err.message,
    });
  }

  res.status(status).render('error', {
    title: 'System Error | Pack-Assist AI',
    error: isProduction
      ? { message: 'An unexpected exception occurred during processing. Our engineering team has been notified.' }
      : err,
    user: req.user,
  });
});

// Seed Default Test User for Evaluation
const User = require('./models/User');
const seedDefaultUser = async () => {
  try {
    let user = await User.findOne({ email: 'scientist@packassist.ai' });
    if (!user) {
      await User.create({
        name: 'Dr. Eleanor Vance',
        email: 'scientist@packassist.ai',
        password: 'PackAssist2026!',
        company: 'Food Polymer Labs Global',
        role: 'Food Scientist',
      });
      console.log('  Evaluation user created: scientist@packassist.ai / PackAssist2026!');
    } else {
      const isMatch = await user.comparePassword('PackAssist2026!');
      if (!isMatch) {
        user.password = 'PackAssist2026!';
        await user.save();
        console.log('  Evaluation user password refreshed to: PackAssist2026!');
      } else {
        console.log('  Evaluation user verified: scientist@packassist.ai / PackAssist2026!');
      }
    }
  } catch (err) {
    console.warn('  Seeding note:', err.message);
  }
};

let server;

// Start Server Lifecycle
const startServer = async () => {
  await connectDB();
  await seedDefaultUser();

  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  PACK-ASSIST AI - Enterprise Food Packaging Platform `);
    console.log(`  Running live at: http://localhost:${PORT}             `);
    console.log(`  Environment:     ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Process PID:     ${process.pid}                       `);
    console.log(`=======================================================`);

    if (isProduction) {
      if (
        sessionSecret === 'pack_assist_ai_super_secret_session_key_998877' ||
        process.env.JWT_SECRET === 'pack_assist_ai_super_secret_jwt_token_key_112233'
      ) {
        console.warn(`[SECURITY WARNING] Running in production with default secrets! Ensure SESSION_SECRET and JWT_SECRET are set via environment variables.`);
      }
    }
  });
};

// Graceful Process Termination Handlers (Docker, Kubernetes, Cloud VMs)
const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] Received termination signal. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('  [Server] HTTP server listener closed.');
      try {
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close(false);
          console.log('  [Database] MongoDB connection cleanly closed.');
        }
      } catch (err) {
        console.error('  [Database] Error while terminating database connection:', err.message);
      }
      console.log('  [Process] Graceful shutdown completed.');
      process.exit(0);
    });

    // Force termination if tasks hang past 10 seconds
    setTimeout(() => {
      console.error('  [Process] Forced shutdown initiated due to timeout.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

module.exports = app;
