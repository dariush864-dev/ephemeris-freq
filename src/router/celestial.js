const express = require('express');
const router = express.Router();
const { getPlanetaryPositions } = require('../engine/calculator');

router.get('/positions', (req, res) => {
    try {
        const natalDate = req.query.natalDate || null;
        const positions = getPlanetaryPositions(natalDate);
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: positions
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
