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
 * Tạo sẵn thư mục uploads/cv nếu chưa tồn tại.
 *
 * Lưu ý:
 * - Hiện tại route đang dùng multer.memoryStorage(),
 *   nên file upload sẽ nằm trong RAM, KHÔNG ghi xuống thư mục này.
 * - Đoạn này vẫn có thể giữ lại nếu sau này bạn muốn
 *   chuyển sang diskStorage để lưu file vật lý.
 */
const uploadDir = path.join(__dirname, "..", "uploads", "cv");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * ======================================================
 * 2) MULTER STORAGE (OPTIONAL / CURRENTLY UNUSED)
 * ======================================================
 * Đây là cấu hình lưu file xuống ổ đĩa:
 * - destination: nơi lưu file
 * - filename   : đổi tên file để tránh trùng
 *
 * Tuy nhiên:
 * - Ở bên dưới bạn đang dùng memoryStorage()
 * - Nghĩa là block storage này hiện KHÔNG được sử dụng
 *
 * Có thể:
 * - giữ lại để dùng sau
 * - hoặc xóa đi để code gọn hơn
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const timestamp = Date.now();

        // Chuẩn hóa tên file:
        // - thay space thành dấu "-"
        // - loại bỏ ký tự lạ để an toàn hơn
        const safeName = String(file.originalname || "cv")
            .replace(/\s+/g, "-")
            .replace(/[^\w.\-()]+/g, "");

        cb(null, `${timestamp}-${safeName}`);
    },
});

/**
 * ======================================================
 * 3) CLEANUP UPLOADED FILES
 * ======================================================
 * Hàm xóa file đã upload khỏi disk nếu cần rollback.
 *
 * Lưu ý quan trọng:
 * - Hàm này chỉ hữu ích khi dùng diskStorage()
 * - Với memoryStorage(), file không có path vật lý,
 *   nên cleanup này hầu như không có tác dụng
 *
 * Vẫn có thể giữ để tái sử dụng về sau.
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
 * 4) VALIDATE MIME TYPE THEO EXTENSION
 * ======================================================
 * Kiểm tra MIME type có khớp với đuôi file không.
 *
 * Mục tiêu:
 * - chặn trường hợp đổi tên file giả
 *   ví dụ: abc.exe -> abc.pdf
 *
 * Cách hoạt động:
 * - lấy ext từ originalname
 * - đối chiếu với file.mimetype
 */
function isValidMimeByExt(ext, mimetype) {
    const mime = String(mimetype || "").toLowerCase();

    // PDF
    if (ext === ".pdf") return mime.includes("pdf");

    // DOC
    if (ext === ".doc") return mime.includes("msword");

    // DOCX
    if (ext === ".docx") {
        // MIME phổ biến của DOCX:
        // application/vnd.openxmlformats-officedocument.wordprocessingml.document
        return mime.includes("officedocument") || mime.includes("word");
    }

    // IMAGE: JPG / JPEG / PNG
    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        return mime.startsWith("image/");
    }

    // Các định dạng khác: không cho phép
    return false;
}

/**
 * ======================================================
 * 5) MULTER INSTANCE
 * ======================================================
 * Cấu hình multer để nhận file upload từ request.
 *
 * Hiện tại dùng:
 * - memoryStorage(): file nằm trong RAM dưới dạng buffer
 *
 * Ưu điểm:
 * - tiện cho parse trực tiếp PDF / DOCX / IMAGE
 * - không cần lưu file tạm trên ổ đĩa
 *
 * Nhược điểm:
 * - không phù hợp nếu file quá lớn
 *
 * fileSize:
 * - giới hạn tối đa 3MB / file
 * - phù hợp khi deploy Render hoặc môi trường RAM hạn chế
 */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB / file
});

/**
 * ======================================================
 * 6) MIDDLEWARE: CHECK FILE ALLOWED
 * ======================================================
 * Middleware dùng để validate file trước khi chuyển sang controller.
 *
 * Áp dụng cho cả:
 * - upload 1 file  -> req.file
 * - upload nhiều file -> req.files
 *
 * Kiểm tra:
 * 1. Extension có được cho phép theo Settings không
 * 2. MIME type có khớp với extension không
 *
 * Nếu fail:
 * - trả lỗi 400
 * - có thể cleanup file nếu đang dùng diskStorage
 */
async function checkFileAllowed(req, res, next) {
    // Gom file về cùng 1 mảng để xử lý chung
    const files = Array.isArray(req.files)
        ? req.files
        : req.file
            ? [req.file]
            : [];

    // Nếu không có file thì cho controller xử lý tiếp
    if (!files.length) return next();

    try {
        /**
         * Load cấu hình Settings từ DB
         * Nếu chưa có record thì tạo mặc định
         */
        let config = await Setting.findOne();
        if (!config) config = await Setting.create({});

        /**
         * Cấu hình mặc định:
         * - pdf   : cho phép
         * - doc   : cho phép
         * - image : cho phép
         */
        const allow = config.allowedExtensions || {
            pdf: true,
            doc: true,
            image: true,
        };

        /**
         * Validate từng file trong request
         */
        for (const f of files) {
            const ext = path.extname(f.originalname).toLowerCase();
            const mimetype = f.mimetype;

            const isPdf = ext === ".pdf";
            const isDoc = ext === ".doc" || ext === ".docx";
            const isImage = [".jpg", ".jpeg", ".png"].includes(ext);

            /**
             * Kiểm tra file có được cho phép theo Settings không
             */
            const isAllowedBySetting =
                (isPdf && allow.pdf) ||
                (isDoc && allow.doc) ||
                (isImage && allow.image);

            if (!isAllowedBySetting) {
                cleanupUploadedFiles(files);

                return res.status(400).json({
                    ok: false,
                    message: "Định dạng file này không được phép upload theo cấu hình Settings.",
                });
            }

            /**
             * Kiểm tra MIME type có khớp với extension không
             * để tránh fake file
             */
            const isMimeOk = isValidMimeByExt(ext, mimetype);

            if (!isMimeOk) {
                cleanupUploadedFiles(files);

                return res.status(400).json({
                    ok: false,
                    message: "File không đúng định dạng CV (MIME mismatch). Vui lòng upload đúng file PDF/DOCX/IMG.",
                });
            }
        }

        // Tất cả file hợp lệ
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
 * API upload CV:
 *
 * 1. POST /api/cv/upload
 *    - upload 1 file
 *    - form-data key: "file"
 *
 * 2. POST /api/cv/upload-batch
 *    - upload nhiều file
 *    - form-data key: "files"
 *    - tối đa 20 file / request
 */

// Upload 1 CV
router.post(
    "/upload",
    upload.single("file"),
    checkFileAllowed,
    cvController.uploadAndMatchCv
);

// Upload nhiều CV
router.post(
    "/upload-batch",
    upload.array("files", 20),
    checkFileAllowed,
    cvController.uploadAndMatchCvBatch
);

module.exports = router;