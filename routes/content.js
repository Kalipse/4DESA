const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Stockage local des fichiers
const { JWT_SECRET } = process.env;

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']; // Récupérer l'en-tête Authorization
    if (!token) return res.status(401).json({ error: 'No token provided' });
  
    // Extraire le token sans "Bearer"
    const tokenPart = token.split(' ')[1];
    if (!tokenPart) return res.status(401).json({ error: 'Invalid token format' });
  
    jwt.verify(tokenPart, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.userId = decoded.id; // Stocker l'ID utilisateur pour la requête
      console.log('Authorization Header:', req.headers['authorization']);
      next();
    });
  };
  
// Créer un contenu
router.post('/create', authenticate, upload.single('media'), (req, res) => {
  const { content } = req.body;
  const media = req.file ? req.file.path : null;

  db.run(
    `INSERT INTO contents (user_id, content, media) VALUES (?, ?, ?)`,
    [req.userId, content, media],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Content created' });
    }
  );
});

// Lire tous les contenus de l'utilisateur
router.get('/', authenticate, (req, res) => {
  db.all(`SELECT * FROM contents WHERE user_id = ?`, [req.userId], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

// Modifier un contenu
router.put('/:id', authenticate, (req, res) => {
  const { content } = req.body;

  db.run(
    `UPDATE contents SET content = ? WHERE id = ? AND user_id = ?`,
    [content, req.params.id, req.userId],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Content not found' });
      res.json({ message: 'Content updated' });
    }
  );
});

// Supprimer un contenu
router.delete('/:id', authenticate, (req, res) => {
  db.run(
    `DELETE FROM contents WHERE id = ? AND user_id = ?`,
    [req.params.id, req.userId],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Content not found' });
      res.json({ message: 'Content deleted' });
    }
  );
});

module.exports = router;
