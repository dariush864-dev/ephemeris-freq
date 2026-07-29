require('dotenv').config();
const express = require('express');
const path = require('path');
const { sanctuaryGatekeeper, apiLimiter } = require('sanctuary-security');
const celestialRouter = require('./src/router/celestial');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Apply rate limiting across the app
app.use(apiLimiter);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Protect Celestial API routes behind the Sanctuary Gatekeeper
app.use('/api/celestial', sanctuaryGatekeeper, celestialRouter);

app.listen(PORT, () => {
    console.log(`🛡️ Ephemeris Freq online with Sanctuary Shield on port ${PORT}`);
});
