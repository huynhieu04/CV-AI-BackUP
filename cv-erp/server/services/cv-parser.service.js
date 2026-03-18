const Candidate = require("../models/candidate.model");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Tesseract = require("tesseract.js");
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

function guessNameFromText(text) {
    const lines = String(text || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 12);

    for (const line of lines) {
        if (
            line.length >= 4 &&
            line.length <= 60 &&
            !/@/.test(line) &&
            !/\d{4,}/.test(line)
        ) {
            return line;
        }
    }

    return "Candidate from CV";
}

function isWordMime(mimeType = "") {
    const t = String(mimeType || "").toLowerCase();
    return (
        t.includes("msword") ||
        t.includes("word") ||
        t.includes("officedocument.wordprocessingml.document")
    );
}

function isImageMime(mimeType = "") {
    return String(mimeType || "").toLowerCase().startsWith("image/");
}

async function extractTextFromPdf(buffer) {
    const data = await pdfParse(buffer);
    return String(data?.text || "").trim();
}

async function extractTextFromDocx(buffer) {
    const result = await mammoth.extractRawText({ buffer });
    return String(result?.value || "").trim();
}

async function extractTextFromImage(buffer) {
    const {
        data: { text },
    } = await Tesseract.recognize(buffer, "eng+vie", {
        logger: (m) => {
            if (m?.status === "recognizing text") {
                const p = Math.round((m.progress || 0) * 100);
                console.log(`[OCR] recognizing text... ${p}%`);
            }
        },
    });

    return String(text || "").trim();
}

/* =========================
   MAIN: PARSE FROM BUFFER
========================= */
async function parseCvFromBuffer(buffer, mimeType, cvFileId) {
    if (!buffer) throw new Error("CV buffer is missing");

    const safeMime = String(mimeType || "").toLowerCase();
    let rawText = "";

    console.log("[CV PARSER] mimeType =", safeMime);
    console.log("[CV PARSER] cvFileId =", cvFileId ? String(cvFileId) : null);

    // 1) Extract raw text
    if (safeMime.includes("pdf")) {
        rawText = await extractTextFromPdf(buffer);
    } else if (isWordMime(safeMime)) {
        rawText = await extractTextFromDocx(buffer);
    } else if (isImageMime(safeMime)) {
        rawText = await extractTextFromImage(buffer);
    } else {
        throw new Error("Unsupported CV file type");
    }

    rawText = String(rawText || "")
        .replace(/\u0000/g, "")
        .replace(/\r/g, "\n")
        .trim();

    console.log("[CV PARSER] rawText length =", rawText.length);
    console.log("[CV PARSER] rawText preview =", rawText.slice(0, 500));

    // 2) Nếu extract fail thì chặn luôn, không tạo candidate rỗng
    if (!rawText) {
        throw new Error(
            "Không thể trích xuất nội dung từ CV. Vui lòng dùng file PDF, DOCX hoặc ảnh rõ nét hơn."
        );
    }

    // 3) Gemini extract
    const ai = await extractCvProfileByGemini(rawText);

    // 4) Fallback
    const email = ai.email || extractEmailFromText(rawText);
    const phone = ai.phone || extractPhoneFromText(rawText);
    const fullName = ai.fullName || guessNameFromText(rawText);

    // 5) Save candidate
    const candidate = await Candidate.create({
        fullName,
        email,
        phone,
        skills: Array.isArray(ai.skills) ? ai.skills : [],
        experienceText: ai.experienceText || "",
        educationText: ai.educationText || "",
        languages: Array.isArray(ai.languages) ? ai.languages : [],
        rawText,
        cvFile: cvFileId,
        matchResult: null,
    });

    return {
        text: rawText,
        rawText,
        candidate,
    };
}

module.exports = { parseCvFromBuffer };