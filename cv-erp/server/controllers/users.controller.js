const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

// GET /api/users
async function listUsers(req, res, next) {
    try {
        const users = await User.find({}, "username name email role createdAt updatedAt")
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ users });
    } catch (e) {
        next(e);
    }
}

// POST /api/users
async function createUser(req, res, next) {
    try {
        const { username, password, name, email, role } = req.body;

        if (!username || !password || !name || !email) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu tối thiểu 6 ký tự." });
        }

        const existed = await User.findOne({ $or: [{ username }, { email }] });
        if (existed) {
            return res.status(409).json({ message: "Username hoặc email đã tồn tại." });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            name,
            role: role === "ADMIN" ? "ADMIN" : "HR",
            passwordHash,
        });

        return res.status(201).json({
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (e) {
        next(e);
    }
}

// PATCH /api/users/:id
async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User không tồn tại." });

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role === "ADMIN" ? "ADMIN" : "HR";

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: "Mật khẩu tối thiểu 6 ký tự." });
            }
            user.passwordHash = await bcrypt.hash(password, 10);
        }

        await user.save();

        return res.json({
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (e) {
        next(e);
    }
}

// DELETE /api/users/:id
async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;

        // chặn tự xoá chính mình (khuyên dùng)
        if (req.user?.sub === id) {
            return res.status(400).json({ message: "Không thể xoá chính mình." });
        }

        const ok = await User.findByIdAndDelete(id);
        if (!ok) return res.status(404).json({ message: "User không tồn tại." });

        return res.json({ ok: true });
    } catch (e) {
        next(e);
    }
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
