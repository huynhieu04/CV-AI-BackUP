// server/models/cv-file.model.js
const mongoose = require("mongoose");

const cvFileSchema = new mongoose.Schema(
    {
        originalName: { type: String },
        mimeType: { type: String },
        size: { type: Number },

        //  KHÔNG bắt buộc nữa
        absolutePath: { type: String, required: false },

        //  LƯU BUFFER (đúng với memoryStorage)
        buffer: { type: Buffer },

        uploadedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CVFile", cvFileSchema);
