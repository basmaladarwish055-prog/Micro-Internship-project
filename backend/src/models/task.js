const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        skills: {
            type: [String],
            required: true
        },

        difficulty: {
            type: String,
            enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
            default: "BEGINNER"
        },

        duration: {
            type: Number,
            required: true
        },

        reward: {
            type: Number,
            required: true
        },

        deadline: {
            type: Date,
            required: true
        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["OPEN", "IN_PROGRESS", "COMPLETED"],
            default: "OPEN"
        },

        imageUrl: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);
