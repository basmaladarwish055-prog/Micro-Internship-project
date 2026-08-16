const express = require("express");

const {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask
} = require("../controllers/taskController.js");

const {
    protect,
    companyOnly
} = require("../middleware/authMiddleware.js");

const router = express.Router();


// Create task - Company only
router.post("/", protect, companyOnly, createTask);


// Get all tasks - Public
router.get("/", getTasks);


// Get one task - Public
router.get("/:id", getTask);


// Update task - Company only
router.put("/:id", protect, companyOnly, updateTask);


// Delete task - Company only
router.delete("/:id", protect, companyOnly, deleteTask);


module.exports = router;