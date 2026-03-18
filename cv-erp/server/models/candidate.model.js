const mongoose = require("mongoose");

const matchResultSchema = new mongoose.Schema(
    {
        candidateSummary: {
            mainSkills: [String],
            mainDomains: [String],
            seniority: String,
            confidence: String,
        },
        matches: [
            {
                jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
                jobCode: String,
                jobTitle: String,
                score: Number,
                label: String,
                reasons: [String],
                breakdown: {
                    skills: Number,
                    experience: Number,
                    education: Number,
                    languages: Number,
                },
            },
        ],
        bestJobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
        disclaimer: String,
    },
    { _id: false }
);

const candidateSchema = new mongoose.Schema(
    {
        fullName: { type: String, trim: true, default: "" },
        email: { type: String, trim: true, lowercase: true, default: "" },
        phone: { type: String, trim: true, default: "" },

        skills: { type: [String], default: [] },
        experienceText: { type: String, default: "" },
        educationText: { type: String, default: "" },
        languages: { type: [String], default: [] },

        rawText: { type: String, default: "" },

        cvFile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CVFile",
        },

        matchResult: { type: matchResultSchema, default: null },
    },
    { timestamps: true }
);

candidateSchema.index({ email: 1 });

module.exports = mongoose.model("Candidate", candidateSchema);