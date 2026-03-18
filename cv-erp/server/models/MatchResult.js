const mongoose = require("mongoose");

const matchResultSchema = new mongoose.Schema(
    {
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
        cvFile: { type: mongoose.Schema.Types.ObjectId, ref: "CVFile", default: null }, // ✅ fix tên model
        job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },

        provider: { type: String, default: "gemini" },
        score: { type: Number, default: null },
        label: { type: String, default: null }, // Suitable / Potential / NotFit

        breakdown: {
            skills: Number,
            experience: Number,
            education: Number,
            languages: Number,
        },

        reasons: [String],
        rawResponse: Object,
    },
    { timestamps: true }
);

module.exports = mongoose.model("MatchResult", matchResultSchema);
