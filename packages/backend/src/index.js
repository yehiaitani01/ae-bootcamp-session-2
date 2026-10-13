const path = require('path');
const { createApp } = require('./app');
const { createDatabase } = require('./db/database');

const PORT = process.env.PORT || 3030;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'todos.db');

if (DB_PATH !== ':memory:') {
  require('fs').mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const app = createApp(createDatabase(DB_PATH));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/items`);
});
