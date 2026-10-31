const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin,
    credentials: true,
  })
);

// Request Parsing & Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// Mount Master API Router
app.use('/api/v1', apiRoutes);

// Root Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Brightloop Subscription Management System API',
    docs: '/api/v1/health',
    version: '1.0.0',
  });
});

// 404 & Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
