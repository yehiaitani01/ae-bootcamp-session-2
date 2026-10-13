const { ApiError } = require('../errors');

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

// Express recognises error handlers by their four-argument signature.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unexpected error:', err); // eslint-disable-line no-console
  }
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFoundHandler, errorHandler };
