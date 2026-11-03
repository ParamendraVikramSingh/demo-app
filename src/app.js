const express = require('express');
const cors = require('cors');
const path = require('path');

const requestIdMiddleware = require('./middleware/requestId.middleware');
const loggerMiddleware = require('./middleware/logger.middleware');
const errorMiddleware = require('./middleware/error.middleware');
const routes = require('./routes');

const app = express();

app.use(requestIdMiddleware);
app.use(loggerMiddleware);
app.use(cors());
app.use(express.json());

// Serve static interactive UI
app.use(express.static(path.join(__dirname, '../public')));

// All API routes under /api
app.use('/api', routes);

// 404 — any unmatched route
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler — must be last
app.use(errorMiddleware);

module.exports = app;
