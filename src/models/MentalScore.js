const mongoose = require('mongoose');

const mentalScoreSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  gameType: { type: String, required: true }, // memory, focus, reaction, etc.
  score: { type: Number, required: true }
}, {
  timestamps: true
});

const MentalScore = mongoose.model('MentalScore', mentalScoreSchema);
module.exports = MentalScore;
