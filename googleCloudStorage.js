// googleCloudStorage.js

const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: './finalbar-68c21-193d092d1211.json' // Path to your Google Cloud service account key file
});

const bucket = storage.bucket("shark-app"); // Replace with your bucket name

module.exports = { storage, bucket };
