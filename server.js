const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Import GA4 API handler
const ga4Handler = require('./api/ga4');

// Route GA4 requests to the real API
app.get('/api/ga4', ga4Handler);

app.listen(PORT, () => {
  console.log(`🚀 Dashboard running at http://localhost:${PORT}`);
  console.log(`📊 GA4 connected - Property ID: ${process.env.GA4_PROPERTY_ID}`);
});
