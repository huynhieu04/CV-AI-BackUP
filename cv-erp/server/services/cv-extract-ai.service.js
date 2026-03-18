const { generateJson } = require("./geminiClient");

function buildExtractInstruction() {
    return `
Bạn là hệ thống trích xuất thông tin từ CV (tiếng Việt/Anh) và trả về JSON đúng schema.
- Chỉ trả JSON, KHÔNG thêm chữ.
- Nếu thiếu: "" hoặc [] hoặc "Unknown".
- skills: tối đa 40, ưu tiên kỹ năng theo ngành trong CV.
- languages: chỉ tên ngôn ngữ (English, Vietnamese, Japanese, Korean, Chinese...).
- seniority: Intern|Fresher|Junior|Mid|Senior|Lead|Unknown

SCHEMA:
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "skills": ["string"],
  "languages": ["string"],
  "experienceText": "string",
  "educationText": "string",
  "seniority": "Intern|Fresher|Junior|Mid|Senior|Lead|Unknown"
}
`.trim();
}

function normalize(res) {
    const safeArr = (a, n) =>
        Array.isArray(a) ? a.map(v => String(v || "").trim()).filter(Boolean).slice(0, n) : [];

    const allowed = new Set(["Intern", "Fresher", "Junior", "Mid", "Senior", "Lead", "Unknown"]);

    const s = String(res?.seniority || "Unknown");
    return {
        fullName: String(res?.fullName || "").trim(),
        email: String(res?.email || "").trim(),
        phone: String(res?.phone || "").trim(),
        skills: safeArr(res?.skills, 40),
        languages: safeArr(res?.languages, 10),
        experienceText: String(res?.experienceText || "").trim(),
        educationText: String(res?.educationText || "").trim(),
        seniority: allowed.has(s) ? s : "Unknown",
    };
}

async function extractCvProfileByGemini(rawText) {
    const systemInstruction = buildExtractInstruction();

    const text = String(rawText || "");
    const clipped = text.length > 18000 ? text.slice(0, 18000) : text;

    const payloadJson = JSON.stringify({ rawText: clipped }, null, 2);
    const res = await generateJson(systemInstruction, payloadJson);

    if (!res || res._parseError) return normalize({});
    return normalize(res);
}

module.exports = { extractCvProfileByGemini };
