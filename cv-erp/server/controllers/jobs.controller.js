// server/controllers/jobs.controller.js
const Job = require("../models/job.model");
const XLSX = require("xlsx");

// =====================
// Helpers: Auto Code (clean + đẹp)
// =====================
function makePrefixFromTitle(title) {
    const words = String(title || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    // lấy chữ cái đầu mỗi từ
    let raw = words.map((w) => (w[0] || "").toUpperCase()).join("");

    // chỉ giữ A-Z
    raw = raw.replace(/[^A-Z]/g, "");

    // lấy tối đa 3 ký tự
    let prefix = raw.slice(0, 3);

    // blacklist prefix nhạy cảm / xấu
    const banned = ["SEX", "XXX", "ASS", "FCK"];
    if (!prefix || banned.includes(prefix)) prefix = "JOB";

    return prefix; // VD: SEW, QAE, BDX, JOB...
}

function pad3(n) {
    return String(n).padStart(3, "0");
}

async function generateJobCode(title) {
    const prefix = makePrefixFromTitle(title);
    const codePrefix = `JD-${prefix}-`;

    const last = await Job.findOne({ code: { $regex: `^${codePrefix}` } })
        .sort({ code: -1 })
        .lean();

    let nextNumber = 1;
    if (last?.code) {
        const m = last.code.match(/(\d{3})$/);
        if (m) nextNumber = Number(m[1]) + 1;
    }

    return `${codePrefix}${pad3(nextNumber)}`;
}

// =====================
// Helpers: Normalize level/type (Excel import)
// =====================
function normalizeLevel(v) {
    const s = String(v || "").trim().toLowerCase();
    const map = {
        intern: "Intern",
        internship: "Intern",
        junior: "Junior",
        middle: "Middle",
        mid: "Middle",
        senior: "Senior",
        manager: "Manager",
        lead: "Manager",
    };
    return map[s] || "";
}

function normalizeType(v) {
    const s = String(v || "").trim().toLowerCase();
    const map = {
        "full-time": "Full-time",
        fulltime: "Full-time",
        "full time": "Full-time",
        "part-time": "Part-time",
        parttime: "Part-time",
        "part time": "Part-time",
        internship: "Internship",
        intern: "Internship",
        contract: "Contract",
        freelance: "Contract",
    };
    return map[s] || "";
}

function pick(row, ...keys) {
    for (const k of keys) {
        const val = row?.[k];
        if (val !== undefined && val !== null && String(val).trim() !== "") return val;
    }
    return "";
}

/**
 * Build counters for prefixes (để import không bị trùng code)
 * counters[prefix] = nextNumber
 */
async function buildPrefixCounters(prefixes) {
    const counters = {};
    for (const prefix of prefixes) {
        const codePrefix = `JD-${prefix}-`;
        const last = await Job.findOne({ code: { $regex: `^${codePrefix}` } })
            .sort({ code: -1 })
            .lean();

        let nextNumber = 1;
        if (last?.code) {
            const m = last.code.match(/(\d{3})$/);
            if (m) nextNumber = Number(m[1]) + 1;
        }

        counters[prefix] = nextNumber;
    }
    return counters;
}

// =====================
// GET /api/jobs
// =====================
exports.getAll = async (req, res, next) => {
    try {
        const keyword = req.query.q?.trim();
        const query = {};

        if (keyword) {
            query.$or = [
                { code: { $regex: keyword, $options: "i" } },
                { title: { $regex: keyword, $options: "i" } },
            ];
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        return res.json({ ok: true, jobs });
    } catch (err) {
        next(err);
    }
};

// =====================
// POST /api/jobs  (code tự sinh)
// =====================
exports.create = async (req, res, next) => {
    try {
        const {
            title,
            level,
            type,
            skillsRequired,
            experienceRequired,
            educationRequired,
            description,
            isActive,
        } = req.body;

        if (!title || !String(title).trim()) {
            return res.status(400).json({ ok: false, message: "Thiếu title" });
        }

        const code = await generateJobCode(title);

        const job = await Job.create({
            code,
            title: String(title).trim(),
            level: level || "",
            type: type || "",
            skillsRequired: skillsRequired || "",
            experienceRequired: experienceRequired || "",
            educationRequired: educationRequired || "",
            description: description || "",
            isActive: typeof isActive === "boolean" ? isActive : true,
        });

        return res.status(201).json({ ok: true, job });
    } catch (err) {
        // duplicate code
        if (err?.code === 11000) {
            return res.status(409).json({ ok: false, message: "Job code bị trùng, thử lại" });
        }
        next(err);
    }
};

// =====================
// PATCH /api/jobs/:id
// =====================
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payload = req.body || {};

        // chặn sửa code để ổn định
        if (payload.code) delete payload.code;

        const job = await Job.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true,
        });

        if (!job) {
            return res.status(404).json({ ok: false, message: "Không tìm thấy JD" });
        }

        return res.json({ ok: true, job });
    } catch (err) {
        next(err);
    }
};

// =====================
// DELETE /api/jobs/:id
// =====================
exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const job = await Job.findByIdAndDelete(id);

        if (!job) {
            return res.status(404).json({ ok: false, message: "Không tìm thấy JD" });
        }

        return res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// =====================
// POST /api/jobs/import   (upload excel -> parse -> insertMany)
// Route: router.post("/import", upload.single("file"), jobsController.importExcel)
// =====================
exports.importExcel = async (req, res, next) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ ok: false, message: "Thiếu file Excel (field: file)" });
        }

        // 1) Read excel from memory buffer
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!rows.length) {
            return res.status(400).json({ ok: false, message: "File rỗng hoặc không đọc được dữ liệu" });
        }

        // 2) Validate + build docs
        const errors = [];
        const docs = [];

        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];

            // hỗ trợ header EN + VI
            const title = String(pick(r, "title", "Tên vị trí", "Ten vi tri", "Job Title")).trim();
            if (!title) {
                errors.push({ row: i + 2, message: "Thiếu title / Tên vị trí" }); // +2 vì header là dòng 1
                continue;
            }

            const level = normalizeLevel(pick(r, "level", "Cấp độ", "Cap do", "Level"));
            const type = normalizeType(pick(r, "type", "Hình thức", "Hinh thuc", "Type"));

            const skillsRequired = String(pick(r, "skillsRequired", "Kỹ năng", "Ky nang", "Skills")).trim();
            const experienceRequired = String(pick(r, "experienceRequired", "Kinh nghiệm", "Kinh nghiem", "Experience")).trim();
            const educationRequired = String(pick(r, "educationRequired", "Học vấn", "Hoc van", "Education")).trim();
            const description = String(pick(r, "description", "Mô tả", "Mo ta", "Description")).trim();

            // isActive optional
            let isActive = true;
            const rawActive = pick(r, "isActive", "Active", "IsActive", "Bật", "Bat");
            if (rawActive !== "") {
                const s = String(rawActive).trim().toLowerCase();
                isActive = s === "true" || s === "1" || s === "yes" || s === "y";
            }

            docs.push({
                title,
                level,
                type,
                skillsRequired,
                experienceRequired,
                educationRequired,
                description,
                isActive,
            });
        }

        if (!docs.length) {
            return res.status(400).json({
                ok: false,
                message: "Không có dòng hợp lệ để import",
                errors,
            });
        }

        // 3) Generate code WITHOUT duplicates (prefix counters)
        const prefixes = [...new Set(docs.map((d) => makePrefixFromTitle(d.title)))];
        const counters = await buildPrefixCounters(prefixes);

        for (const d of docs) {
            const prefix = makePrefixFromTitle(d.title);
            const n = counters[prefix] || 1;

            d.code = `JD-${prefix}-${pad3(n)}`;
            counters[prefix] = n + 1;

            // title clean
            d.title = String(d.title).trim();
        }

        // 4) insertMany (ordered:false -> không fail cả batch)
        let inserted = [];
        try {
            inserted = await Job.insertMany(docs, { ordered: false });
        } catch (e) {
            if (e?.writeErrors?.length) {
                e.writeErrors.forEach((we) => {
                    errors.push({
                        row: null,
                        message: we?.errmsg || "Duplicate key / insert error",
                    });
                });
                inserted = e.insertedDocs || [];
            } else {
                throw e;
            }
        }

        return res.status(201).json({
            ok: true,
            insertedCount: inserted.length,
            totalRows: rows.length,
            errors,
        });
    } catch (err) {
        next(err);
    }
};
