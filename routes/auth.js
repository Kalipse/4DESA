const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const env = require('dotenv');
env.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Vérifiez que JWT_SECRET est bien défini
console.log('JWT_SECRET:', JWT_SECRET);

// Inscription
router.post('/register', (req, res) => {
  const { username, password, is_private } = req.body;

  // Valider les entrées
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (username, password, is_private) VALUES (?, ?, ?)`,
    [username, hashedPassword, is_private ? 1 : 0],
    (err) => {
      if (err) return res.status(400).json({ error: 'User already exists' });
      res.json({ message: 'User registered' });
    }
  );
});


// Connexion
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Ajout d'une valeur par défaut pour JWT_SECRET
    const token = jwt.sign({ id: user.id }, JWT_SECRET || 'defaultsecret', { expiresIn: '1h' });
    res.json({ token });
  });
});

module.exports = router;
