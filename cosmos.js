const { MongoClient } = require('mongodb');

// URI de connexion à Cosmos DB avec l'API MongoDB
const uri = "mongodb://linkuplnb-server:hZd1Gb0lCV1shCeNEMgFUbWLcCrWcsLprtZGBiS6kXELaJcp31jos3ezFammTIK1bZOYcRLdqnLmACDbzHkpGg%3D%3D@linkuplnb-server.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@linkuplnb-server@";

// Client MongoDB
const client = new MongoClient(uri, {
  useUnifiedTopology: true,
  ssl: true,
});

// Connexion à Cosmos DB
const connectToDb = async () => {
  try {
    await client.connect();
    console.log("Connecté à Cosmos DB via MongoDB");
  } catch (err) {
    console.error("Erreur de connexion à Cosmos DB via MongoDB:", err);
    process.exit(1);
  }
};

// Création de la base de données et de la collection si elles n'existent pas
const databaseId = 'linkup-database';
const containerId = 'LinkUp';

const createDatabaseAndContainer = async () => {
  const db = client.db(databaseId);
  const collections = await db.listCollections().toArray();
  if (!collections.some(col => col.name === containerId)) {
    await db.createCollection(containerId);
    console.log(`Collection ${containerId} créée`);
  }
};

// Récupération de la collection
const getContainer = () => {
  return client.db(databaseId).collection(containerId);
};

// Gestion des événements pour détecter les problèmes de connexion
client.on("close", () => {
  console.error("Connexion au serveur MongoDB fermée !");
});

// Appel de la fonction de connexion
connectToDb().then(() => createDatabaseAndContainer());

module.exports = { getContainer };
