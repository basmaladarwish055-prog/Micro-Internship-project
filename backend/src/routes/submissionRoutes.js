const express = require("express");
const { createSubmission, getTaskSubmissions, reviewSubmission } = require("../controllers/submissionController.js");
const { protect, companyOnly, studentOnly } = require("../middleware/authMiddleware.js");

const router = express.Router();
router.post("/:taskId", protect, studentOnly, createSubmission);
router.get("/task/:taskId", protect, companyOnly, getTaskSubmissions);
router.patch("/:submissionId", protect, companyOnly, reviewSubmission);

module.exports = router;
