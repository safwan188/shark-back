const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  tz: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  education: [String], // An array of strings representing education details
  experience: [String], // An array of strings representing experience details
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report' // This should match the model name for the Report
  }]
}, {
  timestamps: true // Automatically manage createdAt and updatedAt fields
});

const Expert = mongoose.model('Expert', expertSchema);

module.exports = Expert;
