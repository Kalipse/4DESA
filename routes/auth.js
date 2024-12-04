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

// Importer la fonction getContainer
const { getContainer } = require('../cosmos');

// Inscription
router.post('/register', async (req, res) => {
  const { username, password, is_private } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const container = await getContainer();

  try {
    const { resource } = await container.items.create({
      username,
      password: hashedPassword,
      is_private: is_private ? true : false,
    });
    res.json({ message: 'User registered', user: resource });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const container = await getContainer();

  try {
    const { resources: users } = await container.items
      .query({ query: 'SELECT * FROM c WHERE c.username = @username', parameters: [{ name: '@username', value: username }] })
      .fetchAll();

    const user = users[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
