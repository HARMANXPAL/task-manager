const express = require('express');
const { getTasks, createTask, getTask, updateTask, deleteTask, getStats } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to every task route
router.use(protect);

router.get('/stats', getStats);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
