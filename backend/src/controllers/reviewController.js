const mongoose = require("mongoose");
const Review = require("../models/review.js");
const Task = require("../models/task.js");
const Application = require("../models/application.js");

const validId = (id) => mongoose.isValidObjectId(id);

const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!validId(req.params.taskId)) return res.status(400).json({ message: "Invalid task ID" });
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });

        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });
        if (task.status !== "COMPLETED") return res.status(400).json({ message: "Reviews are available only after task completion" });

        let reviewee;
        if (req.user.role === "STUDENT") {
            const application = await Application.findOne({ task: task._id, student: req.user.userId, status: "ACCEPTED" });
            if (!application) return res.status(403).json({ message: "You were not the accepted student for this task" });
            reviewee = task.company;
        } else if (req.user.role === "COMPANY") {
            if (task.company.toString() !== req.user.userId) return res.status(403).json({ message: "You can only review students for your own tasks" });
            const application = await Application.findOne({ task: task._id, status: "ACCEPTED" });
            if (!application) return res.status(400).json({ message: "No accepted student found for this task" });
            reviewee = application.student;
        } else {
            return res.status(403).json({ message: "Only students and companies can create reviews" });
        }

        const review = await Review.create({ reviewer: req.user.userId, reviewee, task: task._id, rating, comment });
        return res.status(201).json({ message: "Review created successfully", review });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: "You have already reviewed this task" });
        return res.status(500).json({ message: "Server error" });
    }
};

const getUserReviews = async (req, res) => {
    try {
        if (!validId(req.params.userId)) return res.status(400).json({ message: "Invalid user ID" });
        const reviews = await Review.find({ reviewee: req.params.userId })
            .populate("reviewer", "name role")
            .populate("task", "title");
        return res.json(reviews);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const getTaskReviews = async (req, res) => {
    try {
        if (!validId(req.params.taskId)) return res.status(400).json({ message: "Invalid task ID" });
        const reviews = await Review.find({ task: req.params.taskId })
            .populate("reviewer", "name role")
            .populate("reviewee", "name role");
        return res.json(reviews);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createReview, getUserReviews, getTaskReviews };
