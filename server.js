const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const port = 4005;

const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4005",
    "https://dolluzcorp.in",
    "https://www.dolluzcorp.in"
];

app.use(cors({
    origin: (origin, callback) => {
        // ✅ allow server-to-server / same-origin / health checks
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
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
const DolluzCorpRoutes = require('./src/backend_routes/Dolluzcorp_server');

app.use("/api/login", LoginRoutes.router);
app.use("/api/employee", EmployeeRoutes);
app.use("/api/Dolluzcorp", DolluzCorpRoutes);

// Serve uploaded files if needed
app.use('/User_profile_file_uploads', express.static(path.join(__dirname, 'User_profile_file_uploads')));
app.use('/Dolluzcorp_banner_file_uploads', express.static(path.join(__dirname, 'Dolluzcorp_banner_file_uploads')));

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
