// server/services/file.service.js
const CvFile = require("../models/cv-file.model");

async function saveCvFile(file) {
    if (!file) throw new Error("File is missing");

    const cvFileDoc = await CvFile.create({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,

        //  LƯU BUFFER (hoặc upload cloud)
        buffer: file.buffer,

        storedAt: new Date(),
    });

    return cvFileDoc;
}

module.exports = { saveCvFile };
