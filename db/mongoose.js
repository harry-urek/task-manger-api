const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGODB_URI;

const ConnectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB Successfully  ....");
    } catch (err) {
        console.error("MongoDB connection error :", err.message);
        process.exit(1);
    }
};

module.exports = { ConnectDB };