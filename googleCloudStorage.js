// googleCloudStorage.js

const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: './finalbar-68c21-3f76081228c1.json' // Path to your Google Cloud service account key file
});

const bucket = storage.bucket("shark-buck"); // Replace with your bucket name

module.exports = { storage, bucket };
