const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     description: Health check endpoint
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'VPN Service API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router; 