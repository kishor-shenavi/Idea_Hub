const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getOffers, getOfferStats, createOffer, deleteOffer,
} = require('../controllers/offerTrackerController');

router.get('/', getOffers);
router.get('/stats', getOfferStats);

router.use(protect);
router.post('/', createOffer);
router.delete('/:id', deleteOffer);

module.exports = router;
