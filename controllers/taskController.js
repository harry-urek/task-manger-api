const Task = require('../models/taskModel.js');
const Project = require('../models/projectModel.js');


const createTask = async (req, res) => {
    const { title, description, dueDate, projectId, assignedTo } = req.body;

    // Verify user is a member of the project
    const project = await Project.findById(projectId);
    if (!project || !project.members.includes(req.user._id)) {
        return res.status(401).json({ message: 'Not authorized for this project' });
    }

    const task = new Task({
        title,
        description,
        dueDate,
        project: projectId,
        assignedTo,
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
};


const getTasksByProject = async (req, res) => {
    const { projectId } = req.params;

    // Verify user is a member of the project
    const project = await Project.findById(projectId);
    if (!project || !project.members.includes(req.user._id)) {
        return res.status(401).json({ message: 'Not authorized for this project' });
    }

    // Filtering, sorting, and searching
    const { status, sortBy, search } = req.query;
    let query = { project: projectId };

    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' }; // Case-insensitive search

    let sortOptions = {};
    if (sortBy) {
        const parts = sortBy.split(':');
        sortOptions[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const tasks = await Task.find(query)
        .populate('assignedTo', 'name email')
        .sort(sortOptions);

    res.json(tasks);
};


const updateTask = async (req, res) => {
    const { title, description, status, dueDate, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
        // Additional check: ensure user is part of the task's project before updating
        const project = await Project.findById(task.project);
        if (!project.members.includes(req.user._id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.dueDate = dueDate || task.dueDate;
        task.assignedTo = assignedTo || task.assignedTo;

        const updatedTask = await task.save();
        res.json(updatedTask);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

const addCommentToTask = async (req, res) => {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
        const project = await Project.findById(task.project);
        if (!project.members.includes(req.user._id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const comment = {
            text,
            author: req.user._id,
        };

        task.comments.push(comment);
        await task.save();
        res.status(201).json({ message: 'Comment added' });

    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

module.exports = { createTask, getTasksByProject, updateTask, addCommentToTask };