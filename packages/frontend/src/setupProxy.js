const { createProxyMiddleware } = require('http-proxy-middleware');

const BACKEND_PORT = process.env.BACKEND_PORT || 3030;

module.exports = (app) => {
  app.use('/api', createProxyMiddleware({ target: `http://localhost:${BACKEND_PORT}` }));
};
