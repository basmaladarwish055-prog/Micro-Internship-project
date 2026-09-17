const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true, unique: true },
    submissionUrl: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["SUBMITTED", "APPROVED", "CHANGES_REQUESTED"], default: "SUBMITTED" }
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
