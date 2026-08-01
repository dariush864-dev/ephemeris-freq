// ============================================================================
// FULL PRODUCTION SERVER: EXPRESS + RATE LIMIT FIX + STATIC ASSETS & API
// ============================================================================

const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. TRUST PROXY FIX (Required for LocalTunnel / Reverse Proxies with express-rate-limit)
app.set('trust proxy', 1);

// 2. MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// 3. RATE LIMITING MIDDLEWARE
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`[SECURITY AUDIT] [RATE_LIMIT_EXCEEDED] IP: ${req.ip} | Path: ${req.path}`);
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  }
});

app.use(limiter);

// 4. SECURITY AUDIT MIDDLEWARE FOR PROTECTED ROUTES
const auditSecurity = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.key || 'NONE';
  const clientIp = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';

  if (apiKey !== 'VALID_SANCTUARY_KEY') {
    console.warn(`[SECURITY AUDIT] [${new Date().toISOString()}] [FAILED_ACCESS_ATTEMPT] IP: ${clientIp} | Path: ${req.path} | UA: ${userAgent} | Invalid key provided: ${apiKey}`);
    return res.status(403).json({ error: 'Access Denied: Invalid Sanctuary Key' });
  }

  next();
};

// 5. API ROUTES
app.get('/positions', auditSecurity, (req, res) => {
  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    positions: [
      { celestialBody: 'Sun ☉', degree: '24°09\'', frequency: '963 Hz' },
      { celestialBody: 'Moon ☽', degree: '12°42\'', frequency: '852 Hz' },
      { celestialBody: 'Mercury ☿', degree: '05°15\'', frequency: '741 Hz' }
    ]
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Online', shield: 'Active', port: PORT });
});

// Fallback to index.html for SPA routing (Express 5 compatible)
app.get(/^\/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 6. SERVER INITIALIZATION
app.listen(PORT, () => {
  console.log(`🛡️ Ephemeris Freq online with Sanctuary Shield on port ${PORT}`);
});
