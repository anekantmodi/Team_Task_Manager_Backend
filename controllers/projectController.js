const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects (Admin: all, Member: assigned)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find().populate('members', 'name email').populate('tasks');
    } else {
      projects = await Project.find({ members: req.user.id }).populate('members', 'name email').populate('tasks');
    }
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email')
      .populate('tasks');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && !project.members.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await Project.create({
      title,
      description,
      createdBy: req.user.id,
      members: [req.user.id] // Admin is a member by default
    });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/add-member
// @access  Private/Admin
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'User already in project' });
    }

    project.members.push(user._id);
    await project.save();
    
    // Add project to user
    user.projects.push(project._id);
    await user.save();

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
