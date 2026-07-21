const express = require('express');
const path = require('path');
const celestialRouter = require('./src/router/celestial');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/celestial', celestialRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
