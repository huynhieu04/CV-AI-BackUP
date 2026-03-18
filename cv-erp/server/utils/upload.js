// server/utils/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve(__dirname, '..', 'uploads', 'cv');

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('[upload] Created dir:', uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path
            .basename(file.originalname, ext)
            .replace(/\s+/g, '-')
            .toLowerCase();
        cb(null, `${Date.now()}-${base}${ext}`);
    },
});

const upload = multer({ storage });

module.exports = upload;
