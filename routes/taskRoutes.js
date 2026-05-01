const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask);

router.route('/:id')
  .put(updateTask)
  .delete(authorize('admin'), deleteTask);

module.exports = router;
