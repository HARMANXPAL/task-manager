const express = require('express');
const {
  getTasks, createTask, getTask, updateTask, deleteTask,
  getStats, getActivity, exportCSV
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/stats',    getStats);
router.get('/activity', getActivity);
router.get('/export',   exportCSV);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
