const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // Base de données en mémoire

db.serialize(() => {
  // Table utilisateurs
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      is_private BOOLEAN DEFAULT 0
    )
  `);

  // Table contenus
  db.run(`
    CREATE TABLE contents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT,
      media TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

module.exports = db;
