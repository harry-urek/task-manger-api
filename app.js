
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { json, urlencoded } = require("body-parser");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use([json(), urlencoded({ extended: true }), cors(), helmet(), morgan("dev")]);
app.get("/", (req, res) => {
    res.send("Welcome to the User Management API");
});
app.use("/api/v1/user", userRoutes);


module.exports = app;