const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GOOGLE_API_KEY) {
    console.warn("[Gemini] GOOGLE_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

async function generateJson(systemInstruction, payloadJson) {
    const result = await model.generateContent({
        contents: [
            {
                role: "user",
                parts: [{ text: `${systemInstruction}\n\nDỮ LIỆU JSON:\n${payloadJson}` }],
            },
        ],
        generationConfig: { responseMimeType: "application/json" },
    });

    const text = result.response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        return { _parseError: e.message, _raw: text.slice(0, 4000) };
    }
}

module.exports = { generateJson };
