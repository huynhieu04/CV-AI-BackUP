const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    try {
        const auth = req.headers.authorization || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
        req.user = payload; // { sub, role, username }
        next();
    } catch (e) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        const role = req.user?.role;
        if (!role) return res.status(401).json({ message: "Unauthorized" });

        if (!roles.includes(role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
}

module.exports = { requireAuth, requireRole };
