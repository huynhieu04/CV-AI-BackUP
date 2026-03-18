// server/controllers/reports.controller.js
const Candidate = require('../models/candidate.model');

// map status giống logic candidates.ts của bạn
function mapStatus(label, score) {
    const normalized = String(label || '').trim().toLowerCase();
    const s = Number(score || 0);

    // label-based (nếu AI trả chữ)
    if (normalized.includes('notfit') || normalized.includes('not fit') || normalized.includes('reject')) {
        return 'NotFit';
    }
    if (normalized.includes('potential') || normalized.includes('tiềm năng') || normalized.includes('tiem_nang')) {
        return 'Potential';
    }
    if (normalized.includes('suitable') || normalized.includes('phù hợp') || normalized.includes('phu_hop')) {
        return 'Suitable';
    }

    // fallback theo score
    if (s >= 75) return 'Suitable';
    if (s >= 50) return 'Potential';
    return 'NotFit';
}

/**
 * GET /api/reports/summary
 * Tổng quan kết quả phân loại CV
 * -> Đọc từ Candidate.matchResult
 */
exports.getSummary = async (req, res) => {
    try {
        // ✅ LẤY TẤT CẢ candidates (kể cả không có match) để tính đúng "không phù hợp"
        const candidates = await Candidate.find().select('matchResult').lean();

        const totalCv = candidates.length;

        let suitable = 0;
        let potential = 0;
        let notFit = 0;

        candidates.forEach((c) => {
            const mr = c?.matchResult || {};
            const matches = Array.isArray(mr.matches) ? mr.matches : [];

            // ✅ Nếu không có match => NotFit
            if (!matches.length) {
                notFit++;
                return;
            }

            // ✅ Tìm best match đúng cách:
            // - Nếu có bestJobId -> ưu tiên match có jobId đó
            // - Nếu không -> lấy score cao nhất
            let best = null;

            if (mr.bestJobId) {
                best =
                    matches.find((m) => String(m.jobId) === String(mr.bestJobId)) ||
                    matches[0];
            } else {
                best = [...matches].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
            }

            const status = mapStatus(best?.label, best?.score);

            if (status === 'Suitable') suitable++;
            else if (status === 'Potential') potential++;
            else notFit++;
        });

        const pct = (n) => (totalCv > 0 ? Math.round((n * 10000) / totalCv) / 100 : 0);

        return res.json({
            totalCv,
            suitable,
            potential,
            notFit,
            suitablePercent: pct(suitable),
            potentialPercent: pct(potential),
            notFitPercent: pct(notFit),
        });
    } catch (err) {
        console.error('[Reports] getSummary error', err);
        return res.status(500).json({
            message: 'Lỗi khi tính toán báo cáo',
            error: err.message,
        });
    }
};
