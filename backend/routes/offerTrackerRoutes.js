const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getOffers, getOfferStats, createOffer, deleteOffer,
} = require('../controllers/offerTrackerController');

router.get('/', getOffers);
router.get('/stats', getOfferStats);

router.use(protect);
// backend/routes/offerTrackerRoutes.js — add
const validate = require('../middlewares/validate');
const { offerSchema } = require('../validators/offerTracker.schema');
router.post('/', validate(offerSchema), createOffer);
router.delete('/:id', deleteOffer);

module.exports = router;
