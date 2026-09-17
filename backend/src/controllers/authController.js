const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user.js");

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required" });
        if (role && !["STUDENT", "COMPANY", "ADMIN"].includes(role)) return res.status(400).json({ message: "Invalid role" });
        if (await User.findOne({ email })) return res.status(400).json({ message: "Email is already registered" });
        const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: role || "STUDENT" });
        return res.status(201).json({ message: "User registered successfully", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) { return res.status(500).json({ message: "Server error" }); }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password" });
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.json({ message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) { return res.status(500).json({ message: "Server error" }); }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.json({ message: "If that email is registered, a reset link has been sent." });
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM) return res.status(503).json({ message: "Password reset email is not configured yet" });
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
        await user.save();
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:4200"}/reset-password/${resetToken}`;
        const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
        await transporter.sendMail({ from: process.env.MAIL_FROM, to: user.email, subject: "Reset your MicroInternship password", text: `Reset your password: ${resetUrl}` });
        return res.json({ message: "If that email is registered, a reset link has been sent." });
    } catch (error) { return res.status(500).json({ message: "Unable to send reset email" }); }
};

const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters" });
        const hash = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({ passwordResetToken: hash, passwordResetExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: "Reset token is invalid or expired" });
        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordResetToken = undefined; user.passwordResetExpires = undefined;
        await user.save();
        return res.json({ message: "Password reset successfully. You can now sign in." });
    } catch (error) { return res.status(500).json({ message: "Unable to reset password" }); }
};

module.exports = { register, login, forgotPassword, resetPassword };
