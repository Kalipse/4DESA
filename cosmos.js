const { MongoClient } = require('mongodb');

// URI de connexion à Cosmos DB avec l'API MongoDB
const uri = "mongodb://linkuplnb-server:hZd1Gb0lCV1shCeNEMgFUbWLcCrWcsLprtZGBiS6kXELaJcp31jos3ezFammTIK1bZOYcRLdqnLmACDbzHkpGg%3D%3D@linkuplnb-server.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@linkuplnb-server@";

// Connexion à Cosmos DB via MongoDB
MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error("Erreur de connexion à Cosmos DB via MongoDB:", err);
    return;
  }

  // Connexion réussie
  console.log("Connecté à Cosmos DB via MongoDB");

  // Identifiants de la base de données et de la collection
  const databaseId = 'linkup-database';
  const containerId = 'LinkUp';

  const db = client.db(databaseId); // Utilisation de MongoClient pour obtenir la base de données
  const collection = db.collection(containerId); // Utilisation de MongoClient pour obtenir la collection

module.exports = {
  getContainer: () => {
    return client.db(databaseId).collection(containerId);
  },
};
