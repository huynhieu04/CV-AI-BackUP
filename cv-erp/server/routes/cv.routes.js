// server/routes/cv.routes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const cvController = require("../controllers/cv.controller");
const Setting = require("../models/setting.model");

const router = express.Router();

/**
 * ======================================================
 * 1) ENSURE UPLOAD DIRECTORY EXISTS
 * ======================================================
 * Đảm bảo thư mục uploads/cv tồn tại để multer lưu file.
 */
const uploadDir = path.join(__dirname, "..", "uploads", "cv");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * ======================================================
 * 2) MULTER STORAGE
 * ======================================================
 *  Lưu file xuống disk và đặt tên "timestamp-originalName"
 * - replace space -> '-' để an toàn
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeName = String(file.originalname || "cv")
            .replace(/\s+/g, "-")
            .replace(/[^\w.\-()]+/g, ""); // optional: bỏ ký tự lạ
        cb(null, `${timestamp}-${safeName}`);
    },
});

/**
 * ======================================================
 * 3) HELPER: CLEANUP UPLOADED FILES (SINGLE + BATCH)
 * ======================================================
 * Nếu file đã lưu mà bị chặn ở middleware sau đó,
 * mình xóa để không rác thư mục uploads/cv.
 */
function cleanupUploadedFiles(files) {
    try {
        for (const f of files || []) {
            if (f?.path && fs.existsSync(f.path)) {
                fs.unlinkSync(f.path);
            }
        }
    } catch (err) {
        console.warn("[cv.routes] cleanupUploadedFiles failed:", err.message);
    }
}

/**
 * ======================================================
 * 4) HELPER: EXTENSION + MIME VALIDATION
 * ======================================================
 * Mục tiêu: "file lạ" -> báo lỗi
 * Check BOTH:
 * - Extension (đuôi file)
 * - MIME type (file.mimetype do browser gửi)
 */
function isValidMimeByExt(ext, mimetype) {
    const mime = String(mimetype || "").toLowerCase();

    // PDF
    if (ext === ".pdf") return mime.includes("pdf");

    // Word
    if (ext === ".doc") return mime.includes("msword");
    if (ext === ".docx") {
        // docx thường có mime: application/vnd.openxmlformats-officedocument.wordprocessingml.document
        return mime.includes("officedocument") || mime.includes("word");
    }

    // Image
    if ([".jpg", ".jpeg", ".png"].includes(ext)) return mime.startsWith("image/");

    return false;
}

/**
 * ======================================================
 * 5) MULTER INSTANCE (LIMIT FILE SIZE)
 * ======================================================
 * Chỉ giới hạn dung lượng mỗi file.
 * (10MB / file)
 */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 }, // Render-safe
});


/**
 * ======================================================
 * 6) MIDDLEWARE: CHECK FILE ALLOWED (Settings + MIME)
 * ======================================================
 *  DÙNG CHUNG cho:
 * - single: req.file
 * - batch : req.files
 *
 * Chặn file lạ:
 * - Check ext theo Settings (pdf/doc/image bật hay tắt)
 * - Check MIME type khớp ext (chống đổi tên file giả)
 * - Nếu fail -> xóa file đã upload + trả lỗi 400
 */
async function checkFileAllowed(req, res, next) {
    // gom file: single -> [req.file], batch -> req.files
    const files = Array.isArray(req.files)
        ? req.files
        : req.file
            ? [req.file]
            : [];

    // không có file -> controller sẽ tự báo thiếu file
    if (!files.length) return next();

    try {
        // 6.1) Load settings (nếu chưa có thì tạo default)
        let config = await Setting.findOne();
        if (!config) config = await Setting.create({});

        // default
        const allow = config.allowedExtensions || { pdf: true, doc: true, image: true };

        // (Optional) Limit tổng dung lượng của batch
        // const totalBytes = files.reduce((s, f) => s + (f.size || 0), 0);
        // if (totalBytes > 50 * 1024 * 1024) {
        //   cleanupUploadedFiles(files);
        //   return res.status(400).json({
        //     ok: false,
        //     message: "Tổng dung lượng batch vượt quá 50MB.",
        //   });
        // }

        // 6.2) Validate từng file
        for (const f of files) {
            const ext = path.extname(f.originalname).toLowerCase();
            const mimetype = f.mimetype;

            const isPdf = ext === ".pdf";
            const isDoc = ext === ".doc" || ext === ".docx";
            const isImage = [".jpg", ".jpeg", ".png"].includes(ext);

            // Check extension theo settings
            const isAllowedBySetting =
                (isPdf && allow.pdf) || (isDoc && allow.doc) || (isImage && allow.image);

            if (!isAllowedBySetting) {
                cleanupUploadedFiles(files);
                return res.status(400).json({
                    ok: false,
                    message: "Định dạng file này không được phép upload theo cấu hình Settings.",
                });
            }

            // Check MIME matches extension (chống đổi tên file giả)
            const isMimeOk = isValidMimeByExt(ext, mimetype);
            if (!isMimeOk) {
                cleanupUploadedFiles(files);
                return res.status(400).json({
                    ok: false,
                    message: "File không đúng định dạng CV (MIME mismatch). Vui lòng upload đúng file PDF/DOCX/IMG.",
                });
            }
        }

        return next();
    } catch (err) {
        console.error("[cv.routes] checkFileAllowed error:", err);
        cleanupUploadedFiles(files);
        return res.status(500).json({
            ok: false,
            message: "Lỗi khi kiểm tra định dạng file upload.",
        });
    }
}

/**
 * ======================================================
 * 7) ROUTES
 * ======================================================
 * - POST /api/cv/upload       (single file) key: "file"
 * - POST /api/cv/upload-batch (multi files) key: "files"
 */

// Upload 1 CV
router.post("/upload", upload.single("file"), checkFileAllowed, cvController.uploadAndMatchCv);

// Upload nhiều CV (tối đa 20 file / request)
router.post(
    "/upload-batch",
    upload.array("files", 20),
    checkFileAllowed,
    cvController.uploadAndMatchCvBatch
);

module.exports = router;
