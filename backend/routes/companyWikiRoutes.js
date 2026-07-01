const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getWikiEntries, getCompanyList, getWikiEntry,
  createWikiEntry, updateWikiEntry, deleteWikiEntry, upvoteWikiEntry,
} = require('../controllers/companyWikiController');

router.get('/', getWikiEntries);
router.get('/companies', getCompanyList);
router.get('/:id', getWikiEntry);

router.use(protect);
router.post('/', createWikiEntry);
router.put('/:id', updateWikiEntry);
router.delete('/:id', deleteWikiEntry);
router.put('/:id/upvote', upvoteWikiEntry);

module.exports = router;
