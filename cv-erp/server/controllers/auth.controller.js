const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function ensureSeed() {
    // HR (upsert theo email unique)
    const hrHash = await bcrypt.hash("123456", 10);
    await User.findOneAndUpdate(
        { email: "hr.manager@example.com" },
        {
            $setOnInsert: { passwordHash: hrHash },
            $set: { username: "hr", name: "HR Manager", role: "HR" },
        },
        { upsert: true, new: true }
    );

    // ADMIN (upsert theo email unique)
    const adminHash = await bcrypt.hash("123456", 10);
    await User.findOneAndUpdate(
        { email: "admin@system.local" },
        {
            $setOnInsert: { passwordHash: adminHash },
            $set: { username: "admin", name: "Admin", role: "ADMIN" },
        },
        { upsert: true, new: true }
    );

    console.log("[Seed] Ensured HR & ADMIN accounts");
}

// chạy seed khi server start
ensureSeed().catch((e) => console.error("[Seed] error:", e));

async function login(req, res, next) {
    try {
        const { username, password } = req.body;

        // cho phép login bằng username hoặc email
        const user = await User.findOne({
            $or: [{ username }, { email: username }],
        });

        if (!user) return res.status(401).json({ message: "Sai username hoặc mật khẩu" });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ message: "Sai username hoặc mật khẩu" });

        const token = jwt.sign(
            { sub: user._id.toString(), role: user.role, username: user.username },
            process.env.JWT_SECRET || "dev_secret",
            { expiresIn: "8h" }
        );

        return res.json({
            ok: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
}

//  QUAN TRỌNG: export đúng để authController.login là function
module.exports = { login };
