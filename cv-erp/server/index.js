// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// routes
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/jobs.routes");
const candidateRoutes = require("./routes/candidates.routes");
const cvRoutes = require("./routes/cv.routes");
const settingsRoutes = require("./routes/settings.routes");
const reportsRoutes = require("./routes/reports.routes");
const usersRoutes = require("./routes/users.routes");


const app = express();

// middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/users", usersRoutes);


// simple health check
app.get("/api/health", (req, res) => {
    res.json({ ok: true, message: "API running" });
});

// error handler (simple)
app.use((err, req, res, next) => {
    console.error("[Error]", err);
    res.status(err.status || 500).json({
        ok: false,
        message: err.message || "Internal server error",
    });
});

const PORT = process.env.PORT || 5000;



connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening at http://localhost:${PORT}`);
    });
});
