// server/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI chưa được cấu hình trong .env");
    }

    try {
        const conn = await mongoose.connect(mongoUri);
        console.log(" MongoDB connected:", conn.connection.host);
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
