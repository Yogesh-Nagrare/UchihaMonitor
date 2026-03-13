const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/Auth');
const {
  createCollection,
  getCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  shareCollection,
  unshareCollection,
  getSharedCollection,
  exportCollection,
  importCollection,
} = require('../controllers/Collection');

// Public — view a shared collection via token (no auth needed)
router.get('/shared/:token', getSharedCollection);

// All routes below require login
router.use(isAuthenticated);

router.post('/', createCollection);        // Create
router.get('/', getCollections);           // Get all mine
router.get('/:id', getCollection);         // Get one + its requests
router.put('/:id', updateCollection);      // Update
router.delete('/:id', deleteCollection);   // Delete + cascade requests
router.get('/:id/export', exportCollection)
router.patch('/:id/share', shareCollection);     // Generate share link
router.patch('/:id/unshare', unshareCollection); // Make private again
router.post('/import', importCollection)
module.exports = router;