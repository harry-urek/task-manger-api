const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile, // UPDATED
} = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');

router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

module.exports = router;