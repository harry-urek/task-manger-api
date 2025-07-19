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
        // UPDATED: Added attachments array.
        // In a real app, you'd use a file handling library like 'multer' to upload files
        // to a service like AWS S3 and store the URLs here.
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