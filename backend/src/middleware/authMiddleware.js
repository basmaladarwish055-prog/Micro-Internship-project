const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

const companyOnly = (req, res, next) => {
    if (req.user.role !== "COMPANY") {
        return res.status(403).json({
            message: "Only companies can perform this action"
        });
    }

    next();
};

const studentOnly = (req, res, next) => {
    if (req.user.role !== "STUDENT") {
        return res.status(403).json({
            message: "Only students can perform this action"
        });
    }

    next();
};

module.exports = {
    protect,
    companyOnly,
    studentOnly
};
