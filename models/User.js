const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true, // Remove whitespace around username
    
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true, // Remove whitespace around username
    
    unique: true
  },
  password: { // Store hashed passwords, never store plain text
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['admin', 'inspector', 'client'], // Example user types
  }
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
