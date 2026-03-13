const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/Auth');
const {
  logHistory,
  getHistory,
  getHistoryEntry,
  deleteHistoryEntry,
  clearHistory,
} = require('../controllers/History');

router.use(isAuthenticated);

router.post('/', logHistory);               // Log a request (auto called by frontend)
router.get('/', getHistory);                // Get all history (supports ?limit, ?page, ?method, ?search)
router.get('/:id', getHistoryEntry);        // Get one entry
router.delete('/clear/all', clearHistory);  // Clear ALL history
router.delete('/:id', deleteHistoryEntry);  // Delete one entry

module.exports = router;