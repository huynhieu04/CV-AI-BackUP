// server/controllers/candidate.controller.js
const Candidate = require("../models/candidate.model");
const MatchResult = require("../models/MatchResult"); // nếu bạn muốn xoá lịch sử match theo candidate

// Helper: map status label từ matchResult.bestJobId + matches
function pickBestMatch(matchResult) {
    if (!matchResult || !Array.isArray(matchResult.matches) || matchResult.matches.length === 0) {
        return null;
    }

    // Nếu bestJobId có thì tìm đúng best match
    const bestId = matchResult.bestJobId ? String(matchResult.bestJobId) : null;
    if (bestId) {
        const m = matchResult.matches.find((x) => String(x.jobId) === bestId);
        if (m) return m;
    }

    // fallback: lấy match score cao nhất
    return matchResult.matches
        .slice()
        .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
}

/**
 * GET /api/candidates
 * - Dùng cho màn list Candidates
 * - Trả payload nhẹ + đủ để hiện bảng
 */
exports.getAll = async (req, res) => {
    try {
        const docs = await Candidate.find()
            .sort({ createdAt: -1 })
            .select("fullName email matchResult createdAt"); // payload nhẹ

        const rows = docs.map((c, idx) => {
            const best = pickBestMatch(c.matchResult);

            return {
                candidateId: c._id,
                stt: idx + 1,
                fullName: c.fullName || "Candidate",
                email: c.email || "",
                bestJobId: best?.jobId || null,
                bestJob: best?.jobTitle || "",
                matchScore: typeof best?.score === "number" ? best.score : 0,
                status: best?.label || "NotFit", // Suitable | Potential | NotFit
                createdAt: c.createdAt,
            };
        });

        return res.json({ ok: true, candidates: rows });
    } catch (err) {
        console.error("[candidates] getAll error:", err);
        return res.status(500).json({
            ok: false,
            message: err.message || "Internal server error",
        });
    }
};

/**
 * GET /api/candidates/:id
 * - Dùng cho màn xem chi tiết (AI Classification)
 * - Mặc định: ẩn rawText (nặng). Nếu cần debug, cho phép query ?debug=1
 */
exports.getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const debug = String(req.query.debug || "") === "1";

        const query = Candidate.findById(id)
            .populate("cvFile", "originalName mimeType size uploadedAt createdAt")
            .populate("matchResult.matches.jobId", "code title level type"); // optional: enrich job info

        if (!debug) query.select("-rawText");

        const doc = await query;

        if (!doc) {
            return res.status(404).json({ ok: false, message: "Candidate not found" });
        }

        return res.json({ ok: true, candidate: doc });
    } catch (err) {
        console.error("[candidates] getOne error:", err);
        return res.status(500).json({
            ok: false,
            message: err.message || "Internal server error",
        });
    }
};

/**
 * DELETE /api/candidates/:id
 * - Xoá candidate
 * - Option: xoá luôn lịch sử MatchResult theo candidate để DB sạch
 */
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await Candidate.findByIdAndDelete(id);
        if (!doc) {
            return res.status(404).json({ ok: false, message: "Candidate not found" });
        }

        // ✅ Nếu bạn muốn xoá cả lịch sử match (khuyến nghị)
        // (Nếu bạn không muốn, comment đoạn này)
        try {
            await MatchResult.deleteMany({ candidate: id });
        } catch (e) {
            console.warn("[candidates] remove: cannot delete match history:", e?.message || e);
        }

        return res.json({ ok: true });
    } catch (err) {
        console.error("[candidates] remove error:", err);
        return res.status(500).json({
            ok: false,
            message: err.message || "Internal server error",
        });
    }
};
