const { getNextSequence } = require('./Counter'); // Use destructuring to import the function
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  index: {
    type: Number,
 
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expert',
  
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  availableStartingDates: [{
    type: Date,
    required: true
  }],
  findings: [{
    type: String,
    required: true
  }],
  findingsPhotos: [{
    type: String, // Assuming you're storing image file paths or URLs
    required: false
  }],
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
  ,  status: {
    type: String,
    required: true
  },
  inspectionDate: {
    type: Date,
   
  },
}, {
  timestamps: true // Automatically manage createdAt and updatedAt fields
});
// Pre-save hook to set default status for new documents only
reportSchema.pre('save', async  function (next) {
  if (this.isNew){
    const counter = await getNextSequence('uniqueId');
    this.index = counter.seq;
    if (!this.status) {
      this.status = 'open';
    }
  }
  // `isNew` is true if this is a new document
 
  next();
});
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
