require('dotenv').config();
const path = require('path');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startCronJobs } = require('./src/config/cron');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  startCronJobs();

  // ── Serve React frontend in production ──────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
  const express = require('express');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to database:', err.message);
  process.exit(1);
});
