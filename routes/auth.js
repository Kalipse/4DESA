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
getContainer().then((container) => {
  console.log('Container fetched successfully!');
}).catch((err) => {
  console.error('Error during container fetch:', err);
});

// Inscription
router.post('/register', async (req, res) => {
  console.log('Received registration request'); // Log pour vérifier que la requête est reçue
  const { username, password, is_private } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const container = await getContainer();

  const userId = username; // Utilisez un UUID si nécessaire

  try {
    const { resource } = await container.items.create({
      id: userId,
      username,
      password: hashedPassword,
      is_private: is_private ? true : false,
    });
    console.log('User created in Cosmos DB:', resource); // Log pour vérifier l'insertion
    res.json({ message: 'User registered', user: resource });
  } catch (err) {
    console.error('Error during user creation:', err.message || err);
    res.status(400).json({ error: 'User already exists or other error' });
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
