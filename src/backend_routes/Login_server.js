require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getDBConnection = require('../../config/db');
const router = express.Router();
const db = getDBConnection("dadmin");

// ✅ Set your SendGrid API key
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 🔹 Middleware to verify JWT
const JWT_SECRET = process.env.JWT_SECRET;
const verifyJWT = (req, res, next) => {
    const token = req.cookies?.dolluzcorp_token;
    if (!token) {
        return res.status(403).json({ message: 'Access Denied. No Token Provided!' });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid Token' });
        }
        req.emp_id = decoded.emp_id;
        next();
    });
};

// 🔹 LOGOUT the JWT
router.post("/logout", (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("dolluzcorp_token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        domain: isProd ? ".dolluzcorp.in" : undefined,
    });

    return res.json({ success: true, message: "Logged out successfully" });
});

// 🔹 LOGIN with JWT
router.post("/Verifylogin", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: "Username and password required" });

    const query = `SELECT * FROM employee WHERE emp_mail_id = ? AND deleted_time IS NULL`;

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("❌ DB query error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (!results || results.length === 0)
            return res.status(401).json({ message: "Invalid credentials" });

        const employee = results[0];

        if (!employee.account_pass)
            return res.status(401).json({ message: "Access denied. Account password is missing." });

        if (employee.app_dAdmin === 0)
            return res.status(401).json({ message: "Access denied. You don't have access for dAdmin." });

        const isPasswordMatch = bcrypt.compareSync(password, employee.account_pass);
        if (!isPasswordMatch)
            return res.status(401).json({ message: "Invalid credentials" });

        if (employee.emp_access_level !== "Admin" && employee.emp_access_level !== "Sub Admin")
            return res.status(403).json({ message: "Access denied. Only Admin or Sub Admin can login." });

        // 🔹 CREATE JWT TOKEN
        const token = jwt.sign({ emp_id: employee.emp_id }, JWT_SECRET);
        const isProd = process.env.NODE_ENV === "production";

        res.cookie("dolluzcorp_token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "None" : "Lax",
            domain: isProd ? ".dolluzcorp.in" : undefined,
        });

        return res.json({
            success: true,
            message: "Login successful",
        });
    });
});

// ✅ VERIFY OLD PASSWORD (with bcrypt)
router.post("/verify-old-password", verifyJWT, (req, res) => {
    if (!req.emp_id) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    const emp_id = req.emp_id;
    const { oldPass } = req.body;

    if (!emp_id) {
        return res.status(400).json({ message: "Employee session expired" });
    }

    const query = `SELECT * FROM employee WHERE emp_id = ? AND deleted_time IS NULL`;

    db.query(query, [emp_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });

        const employee = results[0];

        // 🔒 Verify bcrypt password
        const isPasswordMatch = bcrypt.compareSync(oldPass, employee.account_pass);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }

        return res.json({ message: "Old password verified", emp_id: employee.emp_id });
    });
});

// ✅ UPDATE PASSWORD (encrypt before saving)
router.post("/update-password", verifyJWT, (req, res) => {
    if (!req.emp_id) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    const emp_id = req.emp_id;
    const { email, newPass } = req.body;

    if (!emp_id && !email) {
        return res.status(400).json({ message: "Employee info expired" });
    }

    // 🔹 Encrypt new password using bcrypt
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPass, salt);

    const query = emp_id
        ? `UPDATE employee SET account_pass = ?, updated_time = NOW() WHERE emp_id = ?`
        : `UPDATE employee SET account_pass = ?, updated_time = NOW() WHERE emp_mail_id = ?`;

    const identifier = emp_id || email;

    db.query(query, [hashedPassword, identifier], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ message: "Password updated successfully" });
    });
});

// ✅ Send OTP API with Employee Validation
router.post("/send-otp", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    // ✅ Check if Employee exists
    const query = `SELECT * FROM employee WHERE emp_mail_id = ? AND deleted_time IS NULL`;
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(404).json({ message: "Employee not found" });

        // ✅ Employee exists → Generate OTP
        generateOTP(email, res);
    });
});

// 🔹 Generate OTP Function
const generateOTP = (userInput, res) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 5 * 60000);

    const query = `INSERT INTO otpstorage (UserInput, OTP, ExpiryTime) VALUES (?, ?, ?) 
                   ON DUPLICATE KEY UPDATE OTP = ?, ExpiryTime = ?`;

    db.query(query, [userInput, otp, expiryTime, otp, expiryTime], async (err) => {
        if (err) {
            console.error('❌ Error in generateOTP:', err);
            return res.status(500).json({ message: 'Error generating OTP' });
        }

        // ✅ SendGrid Email Format
        const msg = {
            to: userInput,
            from: '"dAdmin Support" <support@dolluzcorp.in>',
            subject: "dAdmin Password Reset - Your OTP Code",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                  <h2 style="color: #4A90E2;">dAdmin - One Time Password (OTP)</h2>
                  <p>Hello,</p>
                  <p>We received a request to reset your password on <strong>dAdmin</strong>.</p>
                  <p>Please use the following OTP to verify your identity:</p>
                  <h3 style="color: #333; font-size: 24px;">${otp}</h3>
                  <p>This OTP is valid for <strong>2 minutes</strong>. Do not share this code with anyone.</p>
                  <p>If you did not request a password reset, please ignore this message.</p>
                  <br/>
                  <p style="color: #888;">-The dAdmin Team</p>
                </div>
              `
        };

        try {
            await sgMail.send(msg);
            res.json({ message: "OTP sent successfully" });
        } catch (error) {
            console.error("❌ Error sending OTP email:", error.response?.body || error);
            res.status(500).json({ message: "Failed to send OTP email" });
        }
    });
};

// ✅ Verify OTP API
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP required" });
    }

    const query = `SELECT * FROM otpstorage WHERE UserInput = ?`;

    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(404).json({ message: "OTP not found" });

        const storedOtp = results[0];

        if (storedOtp.OTP !== otp) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        if (new Date() > new Date(storedOtp.ExpiryTime)) {
            return res.status(410).json({ message: "OTP expired" });
        }

        return res.json({ message: "OTP verified" });
    });
});

module.exports = { router, verifyJWT };