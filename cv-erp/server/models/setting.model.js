const mongoose = require('mongoose');

const aiSettingsSchema = new mongoose.Schema(
    {
        weights: {
            skills: { type: Number, default: 0.4 },
            experience: { type: Number, default: 0.3 },
            education: { type: Number, default: 0.2 },
            languages: { type: Number, default: 0.1 },
        },
        allowedExtensions: {
            pdf: { type: Boolean, default: true },
            doc: { type: Boolean, default: true },
            image: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('AiSetting', aiSettingsSchema);
