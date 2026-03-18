const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true },
        title: { type: String, required: true },

        // ✅ NEW: level + type
        level: {
            type: String,
            enum: ["Intern", "Junior", "Middle", "Senior", "Manager", ""],
            default: "",
        },
        type: {
            type: String,
            enum: ["Full-time", "Part-time", "Internship", "Contract", ""],
            default: "",
        },

        skillsRequired: { type: String, default: "" },
        experienceRequired: { type: String, default: "" },
        educationRequired: { type: String, default: "" },
        description: { type: String, default: "" },

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
