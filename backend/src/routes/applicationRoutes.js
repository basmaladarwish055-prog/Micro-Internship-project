const express = require("express");

const {
    applyForTask,
    getTaskApplications,
    updateApplicationStatus
} = require("../controllers/applicationController.js");

const {
    protect,
    companyOnly
} = require("../middleware/authMiddleware.js");

const router = express.Router();


// Student applies
router.post(
    "/task/:taskId",
    protect,
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