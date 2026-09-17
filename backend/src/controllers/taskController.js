const Task = require("../models/task.js");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.isValidObjectId(id);

// CREATE TASK
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            skills,
            difficulty,
            duration,
            reward,
            deadline
        } = req.body;

        if (
            !title ||
            !description ||
            !skills ||
            !duration ||
            reward === undefined ||
            !deadline
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const task = await Task.create({
            title,
            description,
            skills,
            difficulty,
            duration,
            reward,
            deadline,
            company: req.user.userId
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// GET ALL TASKS
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate("company", "name email");

        res.json(tasks);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// GET ONE TASK
const getTask = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }
        const task = await Task.findById(req.params.id)
            .populate("company", "name email");

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(task);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// UPDATE TASK
const updateTask = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (task.company.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only edit your own tasks"
            });
        }

        const allowedFields = ["title", "description", "skills", "difficulty", "duration", "reward", "deadline"];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            message: "Task updated successfully",
            task: updatedTask
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// DELETE TASK
const deleteTask = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (task.company.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only delete your own tasks"
            });
        }

        await task.deleteOne();

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const uploadTaskImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Task image is required" });
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        if (task.company.toString() !== req.user.userId) return res.status(403).json({ message: "You can only upload images for your own tasks" });
        task.imageUrl = `/uploads/${req.file.filename}`;
        await task.save();
        return res.json({ message: "Task image uploaded successfully", task });
    } catch (error) {
        return res.status(500).json({ message: "Unable to upload task image" });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    uploadTaskImage
};
