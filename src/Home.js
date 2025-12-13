import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { apiFetch } from "./utils/api";

import { FaHome, FaBell, FaUserCircle, FaClock, FaUserCog, FaFileAlt, FaHeadset, FaBug } from "react-icons/fa";

import Banner1 from "./assets/img/DOLLUZ_CORP.png";
import Banner2 from "./assets/img/help_desk.png";
import Banner3 from "./assets/img/logo_eagle.png";

const apps = [
    { name: "dAdmin", description: "Admin controls & configuration", url: "https://dadmin.dolluzcorp.in/Support_Tickets", icon: <FaUserCog /> },
    { name: "dForms", description: "Dynamic form builder system", url: "https://dforms.dolluzcorp.in/home", icon: <FaFileAlt /> },
    { name: "dAssist", description: "Support tickets and helpdesk", url: "https://dassist.dolluzcorp.in/Tickets", icon: <FaHeadset /> },
    { name: "dBug", description: "Bug tracking and issue management", url: "https://dbug.dolluzcorp.in/Tickets", icon: <FaBug /> },
    { name: "dTime", description: "Manage attendance, leave, shifts", url: "https://dtime.dolluzcorp.in/Timesheet_entry", icon: <FaClock /> },
];

const updates = [
    { title: "New Feature Released", desc: "dTime shift planner updated", date: "Dec 2025" },
    { title: "Security Patch", desc: "Improved login system", date: "Dec 2025" },
    { title: "New UI Update", desc: "dAssist dashboard revamped", date: "Nov 2025" }
];
const policies = [
    {
        title: "Information Security Policy",
        desc: "Ensuring confidentiality, integrity, and availability of all systems."
    },
    {
        title: "Employee Code of Conduct",
        desc: "Guidelines to maintain professionalism and ethical behavior."
    },
    {
        title: "Data Privacy Policy",
        desc: "Protecting user and organizational data across platforms."
    }
];

const awards = [
    {
        title: "Best Innovation Award 2024",
        desc: "Recognized for building scalable enterprise solutions."
    },
    {
        title: "Excellence in Automation",
        desc: "Awarded for workflow and productivity automation."
    },
    {
        title: "Customer Satisfaction Award",
        desc: "Honored for outstanding client support services."
    }
];

const blogs = [
    {
        id: 1,
        title: "How DolluzCorp Built dForms",
        short: "Inside the architecture and design of the dynamic form system.",
        full: "Full blog content will be shown in Blog Page",
    },
    {
        id: 2,
        title: "Why Automation Matters",
        short: "The future of automated workforce solutions.",
        full: "Full blog content will be shown in Blog Page",
    }
];

const Home = () => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        fetchloginedEmployees();
    }, []);

    const fetchloginedEmployees = async () => {
        try {
            const res = await apiFetch(`/api/employee/logined_employee`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();

            if (data?.message === "Access Denied. No Token Provided!" || data?.message === "Invalid Token") {
                navigate("/login");
                return;
            }
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    };

    const handleLogout = async () => {
        await apiFetch(`/api/login/logout`, {
            method: "POST",
            credentials: "include",
        });

        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className="home-container">

            {/* HEADER */}
            <div className="home-header">
                <div className="header-left">
                    <FaHome className="header-icon" />
                </div>

                {/* CENTER BRAND */}
                <div className="header-center">
                    <span className="brand-text">DolluzCorp</span>
                </div>

                <div className="header-right">
                    <FaBell
                        className="header-icon"
                        onClick={() => setShowNotifications(!showNotifications)}
                    />
                    <FaUserCircle
                        className="header-icon"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    />
                </div>
            </div>

            {/* NOTIFICATION POPUP */}
            {showNotifications && (
                <div className="notification-box">
                    <p>No new notifications</p>
                </div>
            )}

            {/* PROFILE POPUP */}
            {showProfileMenu && (
                <div className="profile-box">
                    <p onClick={() => navigate("/profile")}>Profile</p>
                    <p onClick={() => navigate("/change-password")}>Change Password</p>
                    <p onClick={handleLogout}>Logout</p>
                </div>
            )}

            {/* DAPPS SECTION */}
            <h2 className="section-title">Our dApps</h2>
            <div className="apps-grid">
                {apps.map((app, index) => (
                    <div key={index} className="app-card fade-in" onClick={() => window.open(app.url, "_blank")}>
                        <div className="app-icon">{app.icon}</div>
                        <div className="app-info">
                            <h2>{app.name}</h2>
                            <p>{app.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* BANNER SLIDER */}
            <div className="banner-slider">
                <div className="banner-track">
                    {[Banner1, Banner2, Banner3].map((b, i) => (
                        <img key={i} src={b} alt="banner" className="banner-img" />
                    ))}
                </div>
            </div>

            {/* UPDATES & ANNOUNCEMENTS */}
            <h2 className="section-title">Updates & Announcements</h2>
            <div className="updates-grid">
                {updates.map((u, i) => (
                    <div key={i} className="update-card">
                        <h3>{u.title}</h3>
                        <p>{u.desc}</p>
                        <span>{u.date}</span>
                    </div>
                ))}
            </div>

            {/* Policies */}
            <h2 className="section-title">Company Policies</h2>
            <div className="policies-grid">
                {policies.map((p, i) => (
                    <div key={i} className="policy-card">
                        <h3>{p.title}</h3>
                        <p>{p.desc}</p>
                    </div>
                ))}
            </div>

            {/* BLOG SECTION */}
            <h2 className="section-title">Blogs</h2>
            <div className="blogs-grid">
                {blogs.map((b) => (
                    <div key={b.id} className="blog-card"
                        onClick={() => navigate(`/blog/${b.id}`)}>
                        <h3>{b.title}</h3>
                        <p>{b.short}</p>
                        <button>Read More</button>
                    </div>
                ))}
            </div>

            {/* Awards & Recognition */}
            <h2 className="section-title">Awards & Recognition</h2>
            <div className="awards-grid">
                {awards.map((a, i) => (
                    <div key={i} className="award-card">
                        <h3>{a.title}</h3>
                        <p>{a.desc}</p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Home;
