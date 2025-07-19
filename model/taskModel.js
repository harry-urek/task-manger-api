const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

const taskSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            enum: ['To Do', 'In Progress', 'Done'],
            default: 'To Do',
        },
        dueDate: {
            type: Date,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Project',
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        comments: [commentSchema],

        attachments: [
            {
                name: String,
                url: String
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;