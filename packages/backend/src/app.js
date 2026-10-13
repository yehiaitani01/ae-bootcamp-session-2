const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createItemsRouter } = require('./routes/items');
const { createItemsService } = require('./services/items-service');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler');

function createApp(db) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend server is running' });
  });

  app.use('/api/items', createItemsRouter(createItemsService(db)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
