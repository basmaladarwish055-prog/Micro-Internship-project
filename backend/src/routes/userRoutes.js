const express = require("express");
const { getProfile, updateProfile, changePassword, uploadProfilePhoto } = require("../controllers/userController.js");
const { protect } = require("../middleware/authMiddleware.js");
const { imageUpload } = require("../middleware/uploadMiddleware.js");

const router = express.Router();
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);
router.patch("/profile/photo", protect, imageUpload("photo"), uploadProfilePhoto);
module.exports = router;
