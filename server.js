// Import the configured Express app
const app = require('./app');

const http = require('http');
const dotenv = require('dotenv');
const { Server } = require("socket.io");
const { ConnectDB } = require('./db/mongoose');

dotenv.config();

ConnectDB();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


const userSockets = {};

app.set('socketio', io);
app.set('userSockets', userSockets);

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('register', (userId) => {
        if (userId) {
            userSockets[userId] = socket.id;
            console.log(`User ${userId} registered with socket ${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        for (const userId in userSockets) {
            if (userSockets[userId] === socket.id) {
                delete userSockets[userId];
                break;
            }
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});

// --- Start the Server ---
const PORT = process.env.PORT || 5000;

server.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);