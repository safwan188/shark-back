const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  cityName: {
    type: String,
    required: true,
    trim: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  propertyNumber: {
    type: Number,
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer', // This should match the model name for the Customer
    required: true
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt fields
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
