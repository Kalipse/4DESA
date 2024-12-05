const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({
  endpoint: process.env.COSMOS_URI,
  key: process.env.COSMOS_KEY,
});

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
