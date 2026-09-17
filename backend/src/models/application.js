const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        message: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "REJECTED"],
            default: "PENDING"
        }
    },
    {
        timestamps: true
    }
);

applicationSchema.index({ task: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
