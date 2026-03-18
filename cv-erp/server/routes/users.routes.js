const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middlewares/auth.middleware");
const usersController = require("../controllers/users.controller");

//  ADMIN only
router.use(requireAuth, requireRole("ADMIN"));

router.get("/", usersController.listUsers);
router.post("/", usersController.createUser);
router.patch("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;
