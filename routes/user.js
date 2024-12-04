const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const { JWT_SECRET } = process.env;

// Middleware d'authentification
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const tokenPart = token.split(' ')[1];
  if (!tokenPart) return res.status(401).json({ error: 'Invalid token format' });

  jwt.verify(tokenPart, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = decoded.id; // Stocke l'ID utilisateur dans la requête
    next();
  });
};

// Obtenir tous les utilisateurs publics
router.get('/public', (req, res) => {
  db.all(`SELECT id, username FROM users WHERE is_private = 0`, (err, users) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(users);
  });
});

// Obtenir les informations d'un utilisateur authentifié
router.get('/me', authenticate, (req, res) => {
  db.get(`SELECT id, username, is_private FROM users WHERE id = ?`, [req.userId], (err, user) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

// Mettre à jour le profil de l'utilisateur
router.put('/me', authenticate, (req, res) => {
  const { username, password, is_private } = req.body;

  // Hasher le mot de passe si fourni
  const updates = [];
  const params = [];
  if (username) {
    updates.push('username = ?');
    params.push(username);
  }
  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    updates.push('password = ?');
    params.push(hashedPassword);
  }
  if (typeof is_private !== 'undefined') {
    updates.push('is_private = ?');
    params.push(is_private ? 1 : 0);
  }
  params.push(req.userId);

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, params, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated' });
  });
});

// Supprimer son compte
router.delete('/me', authenticate, (req, res) => {
  db.run(`DELETE FROM users WHERE id = ?`, [req.userId], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  });
});

module.exports = router;
