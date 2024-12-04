const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const userRoutes = require('./routes/user');


dotenv.config(); // Charge les variables d'environnement

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); // Analyse les requêtes JSON

// Routes
app.use('/auth', authRoutes);

// Ajouter la route pour les contenus
app.use('/content', contentRoutes);

// User routes
app.use('/user', userRoutes);


// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
