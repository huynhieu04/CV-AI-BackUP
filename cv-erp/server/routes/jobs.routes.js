const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobs.controller");
const multer = require("multer");

//  upload excel bằng memory (không lưu file lên disk)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// CRUD
router.get("/", jobsController.getAll);
router.post("/", jobsController.create);
router.patch("/:id", jobsController.update);
router.delete("/:id", jobsController.remove);

// IMPORT EXCEL
// POST /api/jobs/import  (nếu bạn mount router này ở /api/jobs)
router.post("/import", upload.single("file"), jobsController.importExcel);

module.exports = router;
