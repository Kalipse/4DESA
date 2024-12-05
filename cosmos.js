const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({
  endpoint: process.env.COSMOS_URI,
  key: process.env.COSMOS_KEY,
});

const databaseId = 'linkup-database';
const containerId = 'LinkUp';

const getContainer = async () => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);
    console.log('Successfully connected to the container');
    return container;
  } catch (error) {
    console.error('Error connecting to Cosmos DB:', error);
  }
};

module.exports = { getContainer };
