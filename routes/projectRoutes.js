const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('admin'), createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);

router.post('/:id/add-member', authorize('admin'), addMember);

module.exports = router;
