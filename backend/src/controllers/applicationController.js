const Application = require("../models/application.js");
const Task = require("../models/task.js");

const applyForTask = async (req, res) => {
    try {
        const { message } = req.body;

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const existingApplication = await Application.findOne({
            task: req.params.taskId,
            student: req.user.userId
        });

        if (existingApplication) {
            return res.status(400).json({
                message: "You already applied for this task"
            });
        }

        const application = await Application.create({
            task: req.params.taskId,
            student: req.user.userId,
            message
        });

        res.status(201).json({
            message: "Application submitted successfully",
            application
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getTaskApplications = async (req, res) => {
    try {
        const applications = await Application.find({
            task: req.params.taskId
        })
            .populate("student", "name email")
            .populate("task", "title");

        res.json(applications);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const application = await Application.findById(
            req.params.applicationId
        );

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        application.status = status;
        await application.save();

        res.json({
            message: `Application ${status.toLowerCase()}`,
            application
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    applyForTask,
    getTaskApplications,
    updateApplicationStatus
};