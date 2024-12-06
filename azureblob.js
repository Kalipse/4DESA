const { BlobServiceClient } = require('@azure/storage-blob');

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

async function uploadToBlobStorage(containerName, filePath, blobName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  const blobClient = containerClient.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blobClient.uploadFile(filePath);

  console.log(`Blob uploaded successfully: ${blobClient.url}`);
  return blobClient.url; 
}

module.exports = { uploadToBlobStorage };
