// ---------- APPLICATION TIER (entrypoint) ----------
const path = require('path');
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;
// Comma-separated list of allowed frontend origins, e.g. "https://eyetech.netlify.app"
// Leave FRONTEND_ORIGIN unset to allow any origin (fine for a small demo/dev setup).
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
}));
app.use(express.json());

app.use('/api', apiRoutes);

// Optional: serve the frontend's index.html from the same server so the
// whole app (presentation + application + data tiers) can run as one
// deployable unit if you don't want to host the frontend separately.
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

app.listen(PORT, () => {
  console.log(`Eyetech backend listening on port ${PORT}`);
});
