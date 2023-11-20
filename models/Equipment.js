const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true // This will add `createdAt` and `updatedAt` fields automatically
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;
