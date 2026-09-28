require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { execFile } = require('child_process');
const path = require('path');

const app = express();

// CORS
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/assets', require('./routes/assets'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/work-orders', require('./routes/workOrders'));
app.use('/api/contractors', require('./routes/contractors'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));

app.get('/api/admin/seed', (req, res) => {
  const seedKey = req.query.key;

  if (seedKey !== process.env.SEED_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  execFile(
    process.execPath,
    [path.join(__dirname, 'seed', 'index.js')],
    { env: process.env },
    (error, stdout, stderr) => {
      if (error) {
        console.error(stderr || error.message);
        return res.status(500).json({
          success: false,
          error: stderr || error.message
        });
      }

      console.log(stdout);
      res.json({
        success: true,
        message: 'Database seeded successfully',
        output: stdout
      });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Central error handler
app.use(require('./middleware/errorHandler'));

// Connect and start
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
