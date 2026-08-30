const express = require('express');
const router = express.Router();
const {
  createVisitRequest,
  getTenantVisitRequests,
  getOwnerVisitRequests,
  updateVisitStatus,
} = require('../controllers/visitController');
const { protect } = require('../middleware/authMiddleware');

// Tenant: submit new visit request
router.route('/').post(protect, createVisitRequest);

// Tenant: list all their own visit requests
router.route('/my-requests').get(protect, getTenantVisitRequests);

// Owner: list all incoming visit requests for their properties
router.route('/incoming').get(protect, getOwnerVisitRequests);

// Both: update visit status (owner: accept/reject, tenant: cancel)
router.route('/:id/status').patch(protect, updateVisitStatus);

module.exports = router;
