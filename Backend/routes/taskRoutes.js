const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskReport,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:taskId')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);
router.get('/report/generate', protect, getTaskReport);
module.exports = router;
