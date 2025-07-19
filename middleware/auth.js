
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getUserById } = require('../controllers/userController');


const authenticateToken = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).send({ message: "Access denied . No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await getUserById(decoded.id);
        next();
    }
    catch (err) {
        return res.status(403).send({ error: "Invalid Token or Expired Token" });
    }
};


const hashPassword = async (req, res, next) => {
    try {
        if (!req.body.password) {
            return res.status(400).json({ message: "Password is required" });
        }

        req.body.password = await bcrypt.hash(req.body.password, 10);
        next();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { authenticateToken, hashPassword };