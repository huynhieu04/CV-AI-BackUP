// server/controllers/cv.controller.js
const { saveCvFile } = require("../services/file.service");
const { parseCvFromBuffer } = require("../services/cv-parser.service");
const { matchCandidateToJobs } = require("../services/aiMatching.service");

// Upload 1 CV
async function uploadAndMatchCv(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, message: "File is missing" });
        }

        const cvFileDoc = await saveCvFile(req.file);

        const { candidate, rawText, text } = await parseCvFromBuffer(
            req.file.buffer,
            req.file.mimetype,
            cvFileDoc._id
        );

        const finalRawText = rawText || text || candidate?.rawText || "";

        const matchResult = await matchCandidateToJobs(
            candidate,
            finalRawText,
            cvFileDoc._id
        );

        candidate.matchResult = matchResult;
        await candidate.save();

        return res.json({
            ok: true,
            cvFile: cvFileDoc,
            candidate,
            matchResult,
        });
    } catch (e) {
        console.error("[uploadAndMatchCv]", e);
        return res.status(500).json({
            ok: false,
            message: e.message || "Server error",
        });
    }
}

// Upload nhiều CV
async function uploadAndMatchCvBatch(req, res) {
    try {
        const files = req.files || [];
        if (!files.length) {
            return res.status(400).json({ ok: false, message: "Files are missing" });
        }

        const results = [];

        for (const file of files) {
            try {
                const cvFileDoc = await saveCvFile(file);

                const { candidate, rawText, text } = await parseCvFromBuffer(
                    file.buffer,
                    file.mimetype,
                    cvFileDoc._id
                );

                const finalRawText = rawText || text || candidate?.rawText || "";

                const matchResult = await matchCandidateToJobs(
                    candidate,
                    finalRawText,
                    cvFileDoc._id
                );

                candidate.matchResult = matchResult;
                await candidate.save();

                results.push({
                    ok: true,
                    fileName: file.originalname,
                    cvFile: cvFileDoc,
                    candidate,
                    matchResult,
                });
            } catch (errOne) {
                console.error("[uploadAndMatchCvBatch:item]", errOne);
                results.push({
                    ok: false,
                    fileName: file.originalname,
                    message: errOne?.message || "Process failed",
                });
            }
        }

        return res.json({
            ok: true,
            total: files.length,
            success: results.filter((x) => x.ok).length,
            failed: results.filter((x) => !x.ok).length,
            results,
        });
    } catch (e) {
        console.error("[uploadAndMatchCvBatch]", e);
        return res.status(500).json({
            ok: false,
            message: e.message || "Server error",
        });
    }
}

module.exports = { uploadAndMatchCv, uploadAndMatchCvBatch };
