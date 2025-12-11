const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const port = 4005;

// ✅ Middleware for CORS - Allow specific origins
const allowedOrigins = [
    'http://localhost:3000',   // Allow React frontend
    "https://dolluzcorp.in",   // Production URL 
    'http://127.0.0.1:3000',   // Allow localhost if accessing via 127.0.0.1
    'http://localhost:4005'    // Allow backend server origin (no trailing slash)
];

// Enable CORS with the allowed origins and credentials
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
            callback(null, origin); // <-- ✅ return origin instead of true
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// ✅ Middleware for parsing JSON and reading HTTP-only cookies
app.use(express.json());
app.use(cookieParser());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());

// Routes
const LoginRoutes = require('./src/backend_routes/Login_server');
const EmployeeRoutes = require('./src/backend_routes/Employee_server');

app.use("/api/login", LoginRoutes.router);
app.use("/api/employee", EmployeeRoutes);

// Serve uploaded files if needed
app.use('/User_profile_file_uploads', express.static(path.join(__dirname, 'User_profile_file_uploads')));

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
