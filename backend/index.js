const express = require('express');
const cors = require('cors');
require('dotenv').config();

const newsRoutes = require('./routes/news');
const analysisRoutes = require('./routes/analysis');
const conflictRoutes = require('./routes/conflicts');
const factcheckRoutes = require('./routes/factcheck');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/news', newsRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/conflicts', conflictRoutes);
app.use('/api/factcheck', factcheckRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Kashf API is running' });
});

app.listen(PORT, () => {
  console.log(`Kashf server running on port ${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.message)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})