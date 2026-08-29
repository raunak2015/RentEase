const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  getOwnerProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route: Get all properties
router.get('/', getProperties);

// Owner protected route: Get owner's own listings
router.get('/my-properties', protect, authorize('owner'), getOwnerProperties);

// Public route: Get single property details
router.get('/:id', getPropertyById);

// Owner protected route: Create new property
router.post('/', protect, authorize('owner'), createProperty);

// Owner protected route: Update & Delete property (ownership validated in controller)
router.put('/:id', protect, authorize('owner'), updateProperty);
router.delete('/:id', protect, authorize('owner'), deleteProperty);

module.exports = router;
