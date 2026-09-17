const express = require("express");
const { createReview, getUserReviews, getTaskReviews } = require("../controllers/reviewController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();
router.post("/:taskId", protect, createReview);
router.get("/user/:userId", getUserReviews);
router.get("/task/:taskId", getTaskReviews);
module.exports = router;
