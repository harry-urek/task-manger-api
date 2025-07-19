const express = require('express');
const router = express.Router();
const {
    createProject,
    getProjects,
    addMemberToProject
} = require('../controllers/projectController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.route('/').post(protect, createProject).get(protect, getProjects);
router.route('/:id/members').put(protect, addMemberToProject);

module.exports = router;