const express = require('express');
const router = express.Router();
const {
  getConflictEvents,
  getNewsByLocation,
  getToneTimeline,
  getConflictByCountry,
} = require('../controllers/conflictController');

router.get('/events', getConflictEvents);
router.get('/location/:location', getNewsByLocation);
router.get('/tone', getToneTimeline);
router.get('/country/:country', getConflictByCountry);

module.exports = router;