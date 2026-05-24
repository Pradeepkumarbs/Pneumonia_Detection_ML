// backend/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imagePath:  { type: String, required: true },
  prediction: { type: String, enum: ['NORMAL', 'PNEUMONIA'], required: true },
  confidence: { type: Number, required: true },  // e.g. 0.87
  threshold:  { type: Number },                  // threshold used
  createdAt:  { type: Date, default: Date.now }
});

// Index for fast history queries
reportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
