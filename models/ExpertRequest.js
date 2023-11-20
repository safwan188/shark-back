const mongoose = require('mongoose');

const expertRequestSchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
  },
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expert',
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],

  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

const ExpertRequest = mongoose.model('ExpertRequest', expertRequestSchema);

module.exports = ExpertRequest;