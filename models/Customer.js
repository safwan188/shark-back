const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Trims whitespace from the ends
    unique: true, // Ensures that no two customers can have the same name
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Ensures that no two customers can have the same phone number
  },
  tz: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Ensures that no two customers can have the same tz
  },
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property', // Assumes you have a Property model defined somewhere
  }]
}, {
  timestamps: true // Automatically manage createdAt and updatedAt fields
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
