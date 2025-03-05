// Simple Express server with standalone health endpoint
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();

// Add middleware
app.use(cors());
app.use(express.json());

// Define root route
app.get('/', (req, res) => {
  res.json({ message: 'VPN Service API - Running' });
});

// Define health route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Backend service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 