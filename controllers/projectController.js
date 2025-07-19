const Project = require('../models/projectModel.js');
const User = require('../models/userModel.js');


const createProject = async (req, res) => {
    const { name, description } = req.body;

    const project = new Project({
        name,
        description,
        owner: req.user._id,
        members: [req.user._id],
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);


};


const getProjects = async (req, res) => {

    const projects = await Project.find({ members: req.user._id }).populate('owner', 'name email');
    res.json(projects);
};

const addMemberToProject = async (req, res) => {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }


    if (project.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
        return res.status(404).json({ message: 'User not found' });
    }


    if (project.members.includes(userToAdd._id)) {
        return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    res.json({ message: 'Member added successfully' });
};


module.exports = { createProject, getProjects, addMemberToProject };