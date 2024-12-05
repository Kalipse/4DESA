const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({
  endpoint: process.env.COSMOS_URI,
  key: process.env.COSMOS_KEY,
});

console.log("COSMOS_URI:", process.env.COSMOS_URI);
console.log("COSMOS_KEY:", process.env.COSMOS_KEY ? "Key exists" : "Key is missing");


const databaseId = 'linkup-database';
const containerId = 'LinkUp';

const getContainer = async () => {
  const database = client.database(databaseId);
  const container = database.container(containerId);
  return container;
};

module.exports = {
  getContainer,
};
