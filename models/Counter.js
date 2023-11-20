const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: {
    type: Number,
    default: 0
  }
});
function getNextSequence(name) {
  return Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true // Create the counter if it doesn't exist
    }
  );
}
module.exports.getNextSequence = getNextSequence;
const Counter = mongoose.model('Counter', counterSchema);
