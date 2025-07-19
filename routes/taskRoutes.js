const express = require('express');
const router = express.Router();
const {
    createTask,
    getTasksByProject,
    updateTask,
    addCommentToTask,
    getMyTasks,
    deleteComment,
    generateTaskDescription,
} = require('../controllers/taskController.js');
const { protect } = require('../middleware/authMiddleware.js');


router.post('/generate-description', protect, generateTaskDescription);

// NEW route to get tasks assigned to the logged-in user
router.get('/', protect, getMyTasks);
router.post('/', protect, createTask);
// router.route('/:projectId').get(protect, getTasksByProject);
router.put('/:id', protect, updateTask);
router.post('/:id/comments', protect, addCommentToTask);
router.delete('/:taskId/comments/:commentId', protect, deleteComment);

module.exports = router;