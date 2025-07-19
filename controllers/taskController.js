const Task = require('../model/taskModel');
const Project = require('../model/projectModel');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // NEW

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const emitNotification = (req, userId, event, data) => {
    const io = req.app.get('socketio');
    const userSocketId = req.app.get('userSockets')[userId.toString()];
    if (userSocketId) {
        io.to(userSocketId).emit(event, data);
    }
}

const createTask = async (req, res) => {
    const { title, description, dueDate, projectId, assignedTo } = req.body;

    const project = await Project.findById(projectId);
    if (!project || !project.members.includes(req.user._id)) {
        return res.status(401).json({ message: 'Not authorized for this project' });
    }

    if (assignedTo && !project.members.includes(assignedTo)) {
        return res.status(400).json({ message: 'Assigned user is not a member of this project' });
    }

    const task = new Task({ title, description, dueDate, project: projectId, assignedTo });
    const createdTask = await task.save();

    if (assignedTo) {
        emitNotification(req, assignedTo, 'task_assigned', {
            message: `You have been assigned a new task: "${title}"`,
            task: createdTask
        });
    }

    res.status(201).json(createdTask);
};

const getTasksByProject = async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project || !project.members.includes(req.user._id)) {
        return res.status(401).json({ message: 'Not authorized for this project' });
    }
    const { status, sortBy, search } = req.query;
    let query = { project: projectId };

    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    let sortOptions = {};
    if (sortBy) {
        const parts = sortBy.split(':');
        sortOptions[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
        sortOptions.createdAt = -1;
    }

    const tasks = await Task.find(query).populate('assignedTo', 'name email').sort(sortOptions);
    res.json(tasks);
};

const getMyTasks = async (req, res) => {
    const tasks = await Task.find({ assignedTo: req.user._id })
        .populate('project', 'name')
        .sort({ dueDate: 1 });
    res.json(tasks);
};


const updateTask = async (req, res) => {
    const { title, description, status, dueDate, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
        const project = await Project.findById(task.project);
        if (!project.members.includes(req.user._id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (assignedTo && !project.members.includes(assignedTo)) {
            return res.status(400).json({ message: 'Assigned user is not a member ' });
        }

        const oldAssignedTo = task.assignedTo;
        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.dueDate = dueDate || task.dueDate;
        task.assignedTo = assignedTo || task.assignedTo;

        const updatedTask = await task.save();

        if (assignedTo && oldAssignedTo?.toString() !== assignedTo.toString()) {
            emitNotification(req, assignedTo, 'task_assigned', {
                message: `Task "${updatedTask.title}" has been assigned to you.`,
                task: updatedTask
            });
        }
        emitNotification(req, task.assignedTo, 'task_updated', {
            message: `Task "${updatedTask.title}" has been updated.`,
            task: updatedTask
        });

        res.json(updatedTask);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

const addCommentToTask = async (req, res) => {
    const { text } = req.body;
    const task = await Task.findById(req.params.id).populate('project', 'members');

    if (task) {
        if (!task.project.members.includes(req.user._id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const comment = { text, author: req.user._id };
        task.comments.push(comment);
        await task.save();

        // NEW: Notify all project members about the new comment
        task.project.members.forEach(memberId => {
            if (memberId.toString() !== req.user._id.toString()) { // Don't notify self
                emitNotification(req, memberId, 'new_comment', {
                    message: `${req.user.name} commented on task: "${task.title}"`,
                    taskId: task._id,
                    projectId: task.project._id
                });
            }
        });

        res.status(201).json({ message: 'Comment added' });
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

const deleteComment = async (req, res) => {
    const task = await Task.findById(req.params.taskId);

    if (task) {
        const comment = task.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        comment.remove();
        await task.save();
        res.json({ message: 'Comment removed' });
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

const generateTaskDescription = async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Based on the following task title, generate a brief, one-paragraph description for a task management system. Title: "${title}"`;
        const result = await model.generateContent(prompt);

        if (!result || !result.response || typeof result.response.text !== "function") {
            return res.status(502).json({ message: "Malformed AI response" });
        }

        let text;
        try {
            text = result.response.text();
        } catch (err) {
            console.error("Error extracting text from AI response:", err);
            return res.status(502).json({ message: "Malformed AI response" });
        }

        if (!text || typeof text !== "string" || !text.trim()) {
            return res.status(502).json({ message: "Empty or invalid AI response" });
        }

        res.json({ description: text });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ message: "Failed to generate AI description" });
    }
};

module.exports = {
    createTask,
    getTasksByProject,
    updateTask,
    addCommentToTask,
    getMyTasks,
    deleteComment,
    generateTaskDescription
};