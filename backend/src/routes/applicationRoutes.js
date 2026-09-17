const express = require("express");

const {
    applyForTask,
    getTaskApplications,
    getMyApplications,
    updateApplicationStatus
} = require("../controllers/applicationController.js");

const {
    protect,
    companyOnly,
    studentOnly
} = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/my", protect, studentOnly, getMyApplications);

// Student applies
router.post(
    "/task/:taskId",
    protect,
    studentOnly,
    applyForTask
);


// Company views applicants
router.get(
    "/task/:taskId",
    protect,
    companyOnly,
    getTaskApplications
);


// Company accepts/rejects
router.patch(
    "/:applicationId",
    protect,
    companyOnly,
    updateApplicationStatus
);

module.exports = router;
