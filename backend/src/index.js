require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Create a new Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'VPN Subscription API' });
});

// Health route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'VPN Service API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 