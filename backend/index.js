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