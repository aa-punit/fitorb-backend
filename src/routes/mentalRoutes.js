const express = require('express');
const router = express.Router();
const { saveMentalScore, getMentalScores } = require('../controllers/mentalController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getMentalScores).post(protect, saveMentalScore);

module.exports = router;
