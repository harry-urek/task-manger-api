
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getUserById } = require('../controllers/userController');


const protect = async (req, res, next) => {
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




module.exports = { protect };