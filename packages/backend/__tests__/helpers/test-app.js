const { createApp } = require('../../src/app');
const { createDatabase } = require('../../src/db/database');

function createTestApp() {
  const db = createDatabase(':memory:');
  return { app: createApp(db), db };
}

module.exports = { createTestApp };
