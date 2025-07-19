# Task Manager API

A comprehensive task tracking and management application that facilitates collaboration and organization within teams or projects. Built with Node.js, Express, MongoDB, and Socket.io for real-time notifications.

## Features

- **User Authentication**: Secure user registration and login with JWT tokens
- **Project Management**: Create projects and manage team members
- **Task Management**: Create, assign, update, and track tasks within projects
- **Real-time Notifications**: Socket.io integration for instant notifications
- **AI-Powered Descriptions**: Generate task descriptions using Google Gemini AI
- **Comments System**: Add and manage comments on tasks
- **Advanced Filtering**: Filter tasks by status, search, and sort options
- **File Attachments**: Support for task attachments (schema ready)

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.io
- **AI Integration**: Google Generative AI (Gemini)
- **Security**: Helmet, CORS, bcryptjs
- **Development**: Nodemon for hot reloading

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key (for AI features)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd harry-urek-task-manger-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your-jwt-secret-key
   GEMINI_API_KEY=your-google-gemini-api-key
   ```

4. **Start the application**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   node server.js
   ```

## API Endpoints

### Authentication
- `POST /api/v1/user/register` - Register a new user
- `POST /api/v1/user/login` - Login user

### User Profile
- `GET /profile/profile` - Get user profile (protected)
- `PUT /profile/profile` - Update user profile (protected)

### Projects
- `POST /api/v1/projects` - Create a new project (protected)
- `GET /api/v1/projects` - Get user's projects (protected)
- `PUT /api/v1/projects/:id/members` - Add member to project (protected)

### Tasks
- `GET /api/v1/tasks` - Get user's assigned tasks (protected)
- `POST /api/v1/tasks` - Create a new task (protected)
- `GET /api/v1/tasks/project/:projectId` - Get tasks by project (protected)
- `PUT /api/v1/tasks/:id` - Update a task (protected)
- `POST /api/v1/tasks/:id/comments` - Add comment to task (protected)
- `DELETE /api/v1/tasks/:taskId/comments/:commentId` - Delete comment (protected)
- `POST /api/v1/tasks/generate-description` - Generate AI task description (protected)

## Data Models

### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  timestamps: true
}
```

### Project
```javascript
{
  name: String (required),
  description: String (required),
  owner: ObjectId (ref: User, required),
  members: [ObjectId] (ref: User),
  timestamps: true
}
```

### Task
```javascript
{
  title: String (required),
  description: String,
  status: String (enum: ['To Do', 'In Progress', 'Done'], default: 'To Do'),
  dueDate: Date,
  project: ObjectId (ref: Project, required),
  assignedTo: ObjectId (ref: User),
  comments: [{
    text: String (required),
    author: ObjectId (ref: User, required),
    createdAt: Date (default: now)
  }],
  attachments: [{
    name: String,
    url: String
  }],
  timestamps: true
}
```

## Socket.io Events

The application uses Socket.io for real-time notifications:

### Client Events
- `register` - Register user socket connection with user ID
- `disconnect` - Handle user disconnection

### Server Events
- `task_assigned` - Emitted when a task is assigned to a user
- `task_updated` - Emitted when a task is updated
- `new_comment` - Emitted when a new comment is added to a task

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```



## Query Parameters

### Tasks Filtering
- `status` - Filter by task status (To Do, In Progress, Done)
- `search` - Search tasks by title
- `sortBy` - Sort tasks (format: `field:direction`, e.g., `dueDate:asc`)

Example:
```
GET /api/v1/tasks/project/123?status=In Progress&search=bug&sortBy=dueDate:asc
```

## Development

### Project Structure
```
harry-urek-task-manger-api/
├── app.js                 # Express app configuration
├── server.js              # Server entry point with Socket.io
├── package.json           # Dependencies and scripts
├── controllers/           # Route controllers
├── db/                    # Database configuration
├── middleware/            # Custom middleware
├── model/                 # Mongoose models
└── routes/                # Route definitions
```

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented)



## Author

harry-urek

---

**Note**: This is a development version (0.0.2). Make sure to properly configure environment variables and database connections before running in production.