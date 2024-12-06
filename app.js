const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const userRoutes = require('./routes/user');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Charger votre fichier swagger.yaml
const swaggerDocument = YAML.load(path.join(__dirname, 'doc', 'swagger.yaml'));

// Crée une instance d'application Express
const app = express();

// Ajoutez Swagger UI comme middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

dotenv.config(); // Charge les variables d'environnement

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); // Analyse les requêtes JSON

// Routes
app.use('/auth', authRoutes);

app.use('/content', contentRoutes);

app.use('/user', userRoutes);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('La documentation Swagger est disponible sur http://localhost:3000/api-docs');
});
