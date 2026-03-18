// server/utils/extractText.js
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

// Optional (nếu sau này cần docx):
// const mammoth = require("mammoth");

function normalizeExtractedText(text) {
    return String(text || "")
        .replace(/\u00A0/g, " ")          // NBSP -> space
        .replace(/[ \t]+/g, " ")          // collapse spaces/tabs
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")       // collapse many blank lines
        .trim();
}

async function extractTextFromAbsolutePath(absolutePath) {
    if (!absolutePath) throw new Error("File path is missing");

    console.log("[extractText] Reading:", absolutePath);

    const ext = path.extname(absolutePath).toLowerCase();

    // PDF
    if (ext === ".pdf") {
        const buffer = await fs.promises.readFile(absolutePath);
        const data = await pdfParse(buffer);
        return normalizeExtractedText(data.text || "");
    }

    // DOCX (mở khi bạn cần)
    // if (ext === ".docx") {
    //   const buffer = await fs.promises.readFile(absolutePath);
    //   const result = await mammoth.extractRawText({ buffer });
    //   return normalizeExtractedText(result.value || "");
    // }

    // Fallback
    const buffer = await fs.promises.readFile(absolutePath);
    return normalizeExtractedText(buffer.toString("utf8"));
}

module.exports = { extractTextFromAbsolutePath, normalizeExtractedText };
