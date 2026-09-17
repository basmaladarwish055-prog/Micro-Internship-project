const User = require("../models/user.js");

const profileFields = "name email role bio skills experience profilePhoto createdAt updatedAt";

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select(profileFields);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const allowedFields = ["name", "email", "bio", "skills", "experience"];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }
        if (updates.name !== undefined && (!updates.name || !updates.name.trim())) return res.status(400).json({ message: "Name cannot be empty" });
        if (updates.skills !== undefined && !Array.isArray(updates.skills)) return res.status(400).json({ message: "Skills must be an array" });
        if (updates.email !== undefined && (!updates.email || !/^\S+@\S+\.\S+$/.test(updates.email))) return res.status(400).json({ message: "A valid email is required" });

        const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true, runValidators: true }).select(profileFields);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: "Email is already registered" });
        return res.status(500).json({ message: "Server error" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const bcrypt = require("bcryptjs");
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        const matches = await bcrypt.compare(currentPassword, user.password);
        if (!matches) return res.status(400).json({ message: "Current password is incorrect" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return res.json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Profile photo is required" });
        const user = await User.findByIdAndUpdate(req.user.userId, { profilePhoto: `/uploads/${req.file.filename}` }, { new: true }).select(profileFields);
        return res.json({ message: "Profile photo updated successfully", user });
    } catch (error) {
        return res.status(500).json({ message: "Unable to upload profile photo" });
    }
};

module.exports = { getProfile, updateProfile, changePassword, uploadProfilePhoto };
