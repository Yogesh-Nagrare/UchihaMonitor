const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/Auth');
const {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
} = require('../controllers/Request');

router.use(isAuthenticated);

router.post('/', createRequest);                           // Create request
router.get('/collection/:collectionId', getRequests);      // Get all in a collection
router.get('/:id', getRequest);                            // Get one
router.put('/:id', updateRequest);                         // Update
router.delete('/:id', deleteRequest);                      // Delete

module.exports = router;