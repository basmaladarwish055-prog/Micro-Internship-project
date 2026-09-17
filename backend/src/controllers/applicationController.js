const mongoose = require("mongoose");
const Application = require("../models/application.js");
const Task = require("../models/task.js");

const isValidId = (id) => mongoose.isValidObjectId(id);

const applyForTask = async (req, res) => {
    try {
        const { message } = req.body;
        if (!isValidId(req.params.taskId)) return res.status(400).json({ message: "Invalid task ID" });
        if (!message || !message.trim()) return res.status(400).json({ message: "Application message is required" });

        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });
        if (task.status !== "OPEN") return res.status(400).json({ message: "This task is not accepting applications" });

        const existingApplication = await Application.findOne({ task: task._id, student: req.user.userId });
        if (existingApplication) return res.status(400).json({ message: "You already applied for this task" });

        const application = await Application.create({ task: task._id, student: req.user.userId, message: message.trim() });
        return res.status(201).json({ message: "Application submitted successfully", application });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: "You already applied for this task" });
        return res.status(500).json({ message: "Server error" });
    }
};

const getTaskApplications = async (req, res) => {
    try {
        if (!isValidId(req.params.taskId)) return res.status(400).json({ message: "Invalid task ID" });
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });
        if (task.company.toString() !== req.user.userId) return res.status(403).json({ message: "You can only view applications for your own tasks" });

        const applications = await Application.find({ task: task._id })
            .populate("student", "name email skills experience")
            .populate("task", "title");
        return res.json(applications);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user.userId })
            .populate({ path: "task", populate: { path: "company", select: "name email" } })
            .sort({ createdAt: -1 });
        return res.json(applications);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!isValidId(req.params.applicationId)) return res.status(400).json({ message: "Invalid application ID" });
        if (!["ACCEPTED", "REJECTED"].includes(status)) return res.status(400).json({ message: "Status must be ACCEPTED or REJECTED" });

        const application = await Application.findById(req.params.applicationId).populate("task");
        if (!application) return res.status(404).json({ message: "Application not found" });
        if (application.task.company.toString() !== req.user.userId) return res.status(403).json({ message: "You can only update applications for your own tasks" });
        if (application.status !== "PENDING") return res.status(400).json({ message: "Only pending applications can be updated" });

        if (status === "ACCEPTED") {
            const acceptedApplication = await Application.findOne({ task: application.task._id, status: "ACCEPTED", _id: { $ne: application._id } });
            if (acceptedApplication) return res.status(400).json({ message: "This task already has an accepted student" });
            if (application.task.status === "COMPLETED") return res.status(400).json({ message: "Cannot accept an application for a completed task" });
            application.task.status = "IN_PROGRESS";
            await application.task.save();
        }

        application.status = status;
        await application.save();
        return res.json({ message: `Application ${status.toLowerCase()}`, application });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { applyForTask, getTaskApplications, getMyApplications, updateApplicationStatus };
