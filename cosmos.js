// cosmos.js
const { MongoClient } = require('mongodb');

// URI de connexion à Cosmos DB avec l'API MongoDB
const uri = "mongodb://linkuplnb-server:hZd1Gb0lCV1shCeNEMgFUbWLcCrWcsLprtZGBiS6kXELaJcp31jos3ezFammTIK1bZOYcRLdqnLmACDbzHkpGg%3D%3D@linkuplnb-server.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@linkuplnb-server@";

// Client MongoDB
const client = new MongoClient(uri, { useUnifiedTopology: true });

// Connexion à Cosmos DB
const connectToDb = async () => {
  try {
    await client.connect();
    console.log("Connecté à Cosmos DB via MongoDB");
  } catch (err) {
    console.error("Erreur de connexion à Cosmos DB via MongoDB:", err);
  }
};

// Connexion à la base de données et la collection
const databaseId = 'linkup-database';
const containerId = 'LinkUp';

const getContainer = () => {
  return client.db(databaseId).collection(containerId);
};

// Appel de la fonction de connexion
connectToDb();

module.exports = { getContainer };
