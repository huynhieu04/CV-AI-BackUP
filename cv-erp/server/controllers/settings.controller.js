const AiSetting = require('../models/setting.model');

// GET /api/settings
exports.getSettings = async (req, res) => {
    try {
        let doc = await AiSetting.findOne();

        if (!doc) {
            // nếu chưa có thì tạo default
            doc = await AiSetting.create({});
        }

        return res.json({ ok: true, settings: doc });
    } catch (err) {
        console.error('[Settings] getSettings error:', err);
        return res
            .status(500)
            .json({ ok: false, message: 'Lỗi khi tải settings', error: err.message });
    }
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
    try {
        const payload = req.body || {};

        let doc = await AiSetting.findOne();
        if (!doc) {
            doc = new AiSetting({});
        }

        // merge an toàn
        doc.weights = {
            ...doc.weights.toObject?.() ?? doc.weights,
            ...(payload.weights || {}),
        };

        doc.allowedExtensions = {
            ...doc.allowedExtensions.toObject?.() ?? doc.allowedExtensions,
            ...(payload.allowedExtensions || {}),
        };

        await doc.save();

        return res.json({ ok: true, settings: doc });
    } catch (err) {
        console.error('[Settings] updateSettings error:', err);
        return res
            .status(500)
            .json({ ok: false, message: 'Lỗi khi lưu settings', error: err.message });
    }
};
