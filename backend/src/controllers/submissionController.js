const mongoose = require("mongoose");
const Submission = require("../models/submission.js");
const Application = require("../models/application.js");
const Task = require("../models/task.js");

const validId = (id) => mongoose.isValidObjectId(id);

const createSubmission = async (req, res) => {
    try {
        const { submissionUrl, description } = req.body;
        if (!validId(req.params.taskId)) return res.status(400).json({ message: "Invalid task ID" });
        if (!submissionUrl || !description) return res.status(400).json({ message: "submissionUrl and description are required" });

        const application = await Application.findOne({ task: req.params.taskId, student: req.user.userId, status: "ACCEPTED" });
        if (!application) return res.status(403).json({ message: "An accepted application is required to submit work" });

        const existing = await Submission.findOne({ application: application._id });
        if (existing) {
            if (existing.status !== "CHANGES_REQUESTED") return res.status(400).json({ message: "An active submission already exists for this task" });
            existing.submissionUrl = submissionUrl;
            existing.description = description;
            existing.status = "SUBMITTED";
            await existing.save();
            return res.json({ message: "Submission resubmitted successfully", submission: existing });
        }

        const submission = await Submission.create({ task: req.params.taskId, student: req.user.userId, application: application._id, submissionUrl, description });
        return res.status(201).json({ message: "Work submitted successfully", submission });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const getTaskSubmissions = async (req, res) => {
    try {
        if (!validId(req.params.taskId)) return res.status(400).json({ message: "Invalid task ID" });
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });
        if (task.company.toString() !== req.user.userId) return res.status(403).json({ message: "You can only view submissions for your own tasks" });

        const submissions = await Submission.find({ task: task._id })
            .populate("student", "name email")
            .populate("application", "status message");
        return res.json(submissions);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const reviewSubmission = async (req, res) => {
    try {
        const { status } = req.body;
        if (!validId(req.params.submissionId)) return res.status(400).json({ message: "Invalid submission ID" });
        if (!["APPROVED", "CHANGES_REQUESTED"].includes(status)) return res.status(400).json({ message: "Status must be APPROVED or CHANGES_REQUESTED" });

        const submission = await Submission.findById(req.params.submissionId).populate("task");
        if (!submission) return res.status(404).json({ message: "Submission not found" });
        if (submission.task.company.toString() !== req.user.userId) return res.status(403).json({ message: "You can only review submissions for your own tasks" });
        if (submission.status === "APPROVED") return res.status(400).json({ message: "This submission has already been approved" });

        submission.status = status;
        submission.task.status = status === "APPROVED" ? "COMPLETED" : "IN_PROGRESS";
        await Promise.all([submission.save(), submission.task.save()]);
        return res.json({ message: `Submission ${status.toLowerCase()}`, submission });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createSubmission, getTaskSubmissions, reviewSubmission };
