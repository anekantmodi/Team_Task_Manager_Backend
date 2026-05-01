const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query;

    // If Admin, get all tasks or filter by project
    // If Member, get only assigned tasks
    if (req.user.role === 'admin') {
      if (req.query.projectId) {
        query = Task.find({ projectId: req.query.projectId });
      } else {
        query = Task.find();
      }
    } else {
      query = Task.find({ assignedTo: req.user.id });
    }

    const tasks = await query.populate('projectId', 'title').populate('assignedTo', 'name email');
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      dueDate,
    });

    project.tasks.push(task._id);
    await project.save();

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only update status
    if (req.user.role === 'member') {
      const isAssigned = task.assignedTo.some(id => id.toString() === req.user.id);
      if (!isAssigned) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Please provide status' });
      }
      
      task.status = status;
      await task.save();
    } else {
      // Admin can update anything
      task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    if (project) {
      project.tasks = project.tasks.filter(t => t.toString() !== task._id.toString());
      await project.save();
    }

    await task.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
