const MentalScore = require('../models/MentalScore');

const saveMentalScore = async (req, res) => {
  try {
    const { gameType, score } = req.body;
    const date = new Date().toISOString().split('T')[0];

    const newScore = await MentalScore.create({
      userId: req.user._id,
      date,
      gameType,
      score
    });

    res.status(201).json(newScore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMentalScores = async (req, res) => {
  try {
    const scores = await MentalScore.find({ userId: req.user._id }).sort({ date: 1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { saveMentalScore, getMentalScores };
