const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/Auth');
const {
  createEnvironment,
  getEnvironments,
  getEnvironment,
  updateEnvironment,
  deleteEnvironment,
  setActiveEnvironment,
  getActiveEnvironment,
} = require('../controllers/Environment');

router.use(isAuthenticated);

router.post('/', createEnvironment);                  // Create
router.get('/', getEnvironments);                     // Get all mine
router.get('/active', getActiveEnvironment);          // Get active env
router.get('/:id', getEnvironment);                   // Get one
router.put('/:id', updateEnvironment);                // Update
router.delete('/:id', deleteEnvironment);             // Delete
router.patch('/:id/activate', setActiveEnvironment);  // Set as active

module.exports = router;