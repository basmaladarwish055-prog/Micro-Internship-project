const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["STUDENT", "COMPANY", "ADMIN"],
            default: "STUDENT"
        },

        bio: {
            type: String,
            trim: true,
            default: ""
        },

        skills: {
            type: [String],
            default: []
        },

        experience: {
            type: String,
            trim: true,
            default: ""
        },

        profilePhoto: {
            type: String,
            default: ""
        },

        passwordResetToken: String,
        passwordResetExpires: Date
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
