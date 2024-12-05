const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { getContainer } = require('../cosmos'); // Import Cosmos DB container
const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Stockage local des fichiers
const { uploadToBlobStorage } = require('../azureblob'); // Import Azure Blob Storage utility

const { JWT_SECRET } = process.env;

// Middleware d'authentification
const authenticate = (req, res, next) => {
    const token = req.headers['authorization']; // Récupérer l'en-tête Authorization
    if (!token) return res.status(401).json({ error: 'No token provided' });
  
    // Extraire le token sans "Bearer"
    const tokenPart = token.split(' ')[1];
    if (!tokenPart) return res.status(401).json({ error: 'Invalid token format' });
  
    jwt.verify(tokenPart, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.userId = decoded.id; // Stocker l'ID utilisateur pour la requête
        next();
    });
};

// Créer un contenu avec média
router.post('/create', authenticate, upload.single('media'), async (req, res) => {
  const { content } = req.body;
  const filePath = req.file?.path; // Chemin du fichier local téléchargé
  const containerName = "media"; // Nom du container Azure Blob
  const container = await getContainer();

  try {
    let mediaUrl = null;
    if (filePath) {
      const blobName = `${req.userId}-${Date.now()}-${req.file.originalname}`;
      mediaUrl = await uploadToBlobStorage(containerName, filePath, blobName);
    }

    const id = `${req.userId}-${Date.now()}`; // Générer un ID unique
    const newContent = {
      id,
      user_id: req.userId,
      content,
      media: mediaUrl,
      createdAt: new Date().toISOString(),
    };

    const { resource } = await container.items.create(newContent);
    res.json({ message: 'Content created', content: resource });
  } catch (err) {
    console.error('Error creating content:', err.message || err);
    res.status(400).json({ error: err.message });
  }
});


// Lire tous les contenus de l'utilisateur
router.get('/', authenticate, async (req, res) => {
    const container = await getContainer();

    try {
        const { resources: contents } = await container.items
            .query({
                query: 'SELECT * FROM c WHERE c.user_id = @user_id',
                parameters: [{ name: '@user_id', value: req.userId }],
            })
            .fetchAll();

        res.json(contents);
    } catch (err) {
        console.error('Error fetching contents:', err.message || err);
        res.status(400).json({ error: err.message });
    }
});

// Modifier un contenu
router.put('/:id', authenticate, upload.single('media'), async (req, res) => {
  const { content } = req.body;
  const filePath = req.file?.path; // Chemin du nouveau fichier
  const containerName = "user-content";
  const container = await getContainer();

  try {
    // Récupérer le contenu existant
    const { resources: contents } = await container.items
      .query({ query: 'SELECT * FROM c WHERE c.id = @id AND c.user_id = @user_id', parameters: [
        { name: '@id', value: req.params.id },
        { name: '@user_id', value: req.userId }
      ]})
      .fetchAll();

    const contentItem = contents[0];
    if (!contentItem) {
      return res.status(404).json({ error: 'Content not found' });
    }

    let mediaUrl = contentItem.media; // Conservez l'ancien média par défaut
    if (filePath) {
      const blobName = `${req.userId}-${Date.now()}-${req.file.originalname}`;
      mediaUrl = await uploadToBlobStorage(containerName, filePath, blobName);
    }

    // Mettez à jour le contenu
    const updatedContent = {
      ...contentItem,
      content: content || contentItem.content,
      media: mediaUrl,
    };

    const { resource } = await container.item(req.params.id).replace(updatedContent);
    res.json({ message: 'Content updated', content: resource });
  } catch (err) {
    console.error('Error updating content:', err.message || err);
    res.status(400).json({ error: err.message });
  }
});

// Supprimer un contenu
router.delete('/:id', authenticate, async (req, res) => {
  const container = await getContainer();

  try {
    console.log('ID reçu:', req.params.id);  // ID du contenu
    console.log('User ID reçu:', req.userId);  // ID de l'utilisateur (username)

    // Rechercher le contenu par ID uniquement
    const { resources: contents } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id',  // Recherche uniquement par 'id'
        parameters: [
          { name: '@id', value: req.params.id }  // Utiliser 'id' comme critère de recherche
        ]
      })
      .fetchAll();

    const existingContent = contents[0];
    if (!existingContent) {
      console.log('Contenu non trouvé');
      return res.status(404).json({ error: 'Content not found' });
    }

    // Supprimer le contenu en utilisant l'id 
    console.log('Suppression du contenu:', req.params.id);
    await container.item(req.params.id).delete();

    res.json({ message: 'Content deleted successfully' });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err.message || err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
