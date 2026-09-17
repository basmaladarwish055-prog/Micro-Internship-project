const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype));
    }
});

const imageUpload = (field) => (req, res, next) => {
    upload.single(field)(req, res, (error) => {
        if (error) return res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : "Upload a JPG, PNG, or WebP image" });
        next();
    });
};

module.exports = { imageUpload };
