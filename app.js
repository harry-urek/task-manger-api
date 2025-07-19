
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { json, urlencoded } = require("body-parser");


const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();
app.use([json(), urlencoded({ extended: true }), cors(), helmet(), morgan("dev")]);
app.get("/", (req, res) => {
    res.send("Welcome to the User Management API");
});
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("profile", profileRoutes);


module.exports = app;