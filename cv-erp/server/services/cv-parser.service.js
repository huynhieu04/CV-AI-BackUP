const Candidate = require("../models/candidate.model");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { extractCvProfileByGemini } = require("./cv-extract-ai.service");

/* =========================
   FALLBACK BASIC
========================= */
function extractEmailFromText(text) {
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const match = String(text || "").match(emailRegex);
    return match ? match[0].trim() : "";
}

function extractPhoneFromText(text) {
    const t = String(text || "");
    const phoneRegex =
        /(\+?\s?84\s?)?(0\d{9,10})|(\+?\d{1,3}[\s.-]?\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4})/;
    const match = t.match(phoneRegex);
    if (!match) return "";
    return String(match[0]).replace(/\s+/g, " ").trim();
}

/* =========================
   MAIN: PARSE FROM BUFFER
========================= */
async function parseCvFromBuffer(buffer, mimeType, cvFileId) {
    if (!buffer) throw new Error("CV buffer is missing");

    let rawText = "";

    // PDF
    if (mimeType.includes("pdf")) {
        const data = await pdfParse(buffer);
        rawText = data.text || "";
    }

    // DOCX
    else if (mimeType.includes("word")) {
        const result = await mammoth.extractRawText({ buffer });
        rawText = result.value || "";
    }

    // IMAGE (OCR placeholder)
    else if (mimeType.startsWith("image/")) {
        rawText = ""; //  có thể tích hợp Tesseract sau
    }

    else {
        throw new Error("Unsupported CV file type");
    }

    // 2️⃣ Gemini AI extract
    const ai = await extractCvProfileByGemini(rawText);

    // 3️⃣ Fallback
    const email = ai.email || extractEmailFromText(rawText);
    const phone = ai.phone || extractPhoneFromText(rawText);
    const fullName = ai.fullName || "Candidate from CV";

    // 4️⃣ Save candidate
    const candidate = await Candidate.create({
        fullName,
        email,
        phone,
        skills: ai.skills || [],
        experienceText: ai.experienceText || "",
        education: ai.educationText || "",
        languages: ai.languages || [],
        rawText,
        cvFile: cvFileId,
        matchResult: null,
    });

    return {
        text: rawText,     // giữ tương thích controller
        rawText,
        candidate,
    };
}

module.exports = { parseCvFromBuffer };
