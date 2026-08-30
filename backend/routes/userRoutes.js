const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserAccount);

router.route('/favorites').get(protect, getFavorites);

router
  .route('/favorites/:propertyId')
  .post(protect, addFavorite)
  .delete(protect, removeFavorite);

module.exports = router;
