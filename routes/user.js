const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { JWT_SECRET } = process.env;

const { getContainer } = require('../cosmos');

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
router.get('/public', async (req, res) => {
  const container = await getContainer();

  try {
    const { resources: users } = await container.items
      .query({ query: 'SELECT c.id, c.username FROM c WHERE c.is_private = false' })
      .fetchAll();

    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Obtenir les informations d'un utilisateur authentifié
router.get('/me', authenticate, async (req, res) => {
  const container = await getContainer();

  try {
    const { resources: users } = await container.items
      .query({ query: 'SELECT c.id, c.username, c.is_private FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: req.userId }] })
      .fetchAll();

    const user = users[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Mettre à jour le profil de l'utilisateur
router.put('/me', authenticate, async (req, res) => {
  const { username, password, is_private } = req.body;
  const container = await getContainer();

  const updates = {};
  if (username) updates.username = username;
  if (password) updates.password = bcrypt.hashSync(password, 10);
  if (typeof is_private !== 'undefined') updates.is_private = is_private ? true : false;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    // Vérifiez si l'utilisateur existe avant de remplacer
    const { resources: users } = await container.items
      .query({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: req.userId }] })
      .fetchAll();

    const user = users[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found in Cosmos DB' });
    }

    // Appliquez les mises à jour
    const { resource } = await container.item(req.userId).replace({
      id: req.userId,
      ...user, // Conserve les champs existants
      ...updates, // Applique les mises à jour
    });

    res.json({ message: 'User updated successfully', user: resource });
  } catch (err) {
    console.error('Error updating user:', err.message || err);
    res.status(400).json({ error: err.message });
  }
});

// Supprimer son compte
router.delete('/me', authenticate, async (req, res) => {
  const container = await getContainer();

  try {
    // Vérifiez si l'utilisateur existe avant de supprimer
    const { resources: users } = await container.items
      .query({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: req.userId }] })
      .fetchAll();

    const user = users[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found in Cosmos DB' });
    }

    const partitionKey = user.username; 

    // Supprimez l'utilisateur
    await container.item(req.userId, partitionKey).delete();

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message || err);
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
