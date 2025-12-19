import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "./ProfileHeader.js";
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
    { title: "New UI Update", desc: "dAssist dashboard revamped", date: "Nov 2025" },
    { title: "Performance Enhancement", desc: "Optimized API response times across all dApps", date: "Nov 2025" }
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

const blogs = [
    {
        id: 1,
        title: "How DolluzCorp Built dForms",
        short: "Architecture & design decisions behind our dynamic form builder.",
        full: "A deep dive into how we designed scalable forms using React and Node.",
        tag: "Engineering"
    },
    {
        id: 2,
        title: "Why Automation Matters in Enterprises",
        short: "How automation reduces cost and increases productivity.",
        full: "We explore real-world use cases of automation inside DolluzCorp.",
        tag: "Automation"
    },
    {
        id: 3,
        title: "Building dAssist: Helpdesk at Scale",
        short: "Challenges faced while creating a multi-tenant support system.",
        full: "Learn how dAssist handles thousands of tickets efficiently.",
        tag: "Support"
    },
    {
        id: 4,
        title: "Security First: Our Auth Strategy",
        short: "JWT, cookies, and role-based access explained.",
        full: "Security architecture behind DolluzCorp applications.",
        tag: "Security"
    },
    {
        id: 5,
        title: "UI/UX Decisions That Worked",
        short: "Small UI decisions that created big impact.",
        full: "Lessons learned from user feedback and iteration.",
        tag: "Design"
    },
    {
        id: 6,
        title: "Scaling DolluzCorp Apps",
        short: "From single server to scalable architecture.",
        full: "How we optimized performance across all dApps.",
        tag: "Scalability"
    }
];

const Home = () => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [offset, setOffset] = useState(0);
    const [active, setActive] = useState(null);
    const carouselRef = useRef(null);
    const trackRef = useRef(null);
    const [loggedInEmp, setLoggedInEmp] = useState(null);

    const handleMouseMove = (e) => {
        if (!carouselRef.current || !trackRef.current) return;

        const container = carouselRef.current;
        const track = trackRef.current;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const percentage = mouseX / rect.width;

        const maxScroll =
            track.scrollWidth - container.clientWidth;

        // Clamp between 0 and maxScroll
        const translateX = -Math.min(
            Math.max(percentage * maxScroll, 0),
            maxScroll
        );

        setOffset(translateX);
    };

    const handleMouseLeave = () => {
        setOffset(0);
        setActive(null);
    };

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
            console.log(data[0]);
            setLoggedInEmp(data[0]);
            if (data?.message === "Access Denied. No Token Provided!" || data?.message === "Invalid Token") {
                navigate("/login");
                return;
            }
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
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
                    <ProfileHeader
                        loggedInEmp={loggedInEmp}
                        setLoggedInEmp={setLoggedInEmp}
                    />
                </div>
                {/* NOTIFICATION POPUP */}
                {showNotifications && (
                    <div className="notification-box">
                        <p>No new notifications</p>
                    </div>
                )}
            </div>

            <section className="section section-apps">
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
            </section>

            <section className="section section-banner">
                {/* BANNER SLIDER */}
                <div className="banner-slider">
                    <div className="banner-track">
                        {[Banner1, Banner2, Banner3].map((b, i) => (
                            <img key={i} src={b} alt="banner" className="banner-img" />
                        ))}
                    </div>
                </div>
            </section>

            <section className="section section-updates">
                {/* UPDATES & ANNOUNCEMENTS */}
                <h2 className="section-title">Updates & Announcements</h2>
                <div className="updates-grid flip-grid">
                    {updates.map((u, i) => (
                        <div key={i} className="flip-card">
                            <div className="flip-inner">

                                {/* FRONT */}
                                <div className={`flip-front color-${i + 1}`}>
                                    <h3>{u.title}</h3>
                                    <p>{u.desc}</p>
                                    <span>{u.date}</span>
                                </div>

                                {/* BACK */}
                                <div className={`flip-back color-${i + 1}`}>
                                    <h3>What’s New?</h3>
                                    <p>
                                        Enhanced performance, better UX, and improved security
                                        updates rolled out successfully.
                                    </p>
                                    <button className="flip-btn">Learn More</button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section section-policies">
                <h2 className="section-title">Company Policies</h2>
                <div className="policies-grid">
                    {policies.map((p, i) => (
                        <div className="policy-card">
                            <div className="policy-icon">📄</div>
                            <h3>{p.title}</h3>
                            <p>{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section section-blogs">
                {/* BLOG SECTION */}
                <h2 className="section-title">Blogs</h2>
                <p className="section-subtitle">
                    Insights, architecture, and product stories from DolluzCorp
                </p>
                <div
                    className="ai-carousel"
                    ref={carouselRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <div
                        className="ai-track"
                        ref={trackRef}
                        style={{ transform: `translateX(${offset}px)` }}
                    >
                        {blogs.map((b, i) => (
                            <div
                                key={b.id}
                                className={`ai-card ${active === i ? "active" : ""}`}
                                onMouseEnter={() => setActive(i)}
                                onMouseLeave={() => setActive(null)}
                                onClick={() => navigate(`/blog/${b.id}`)}
                            >
                                <span className="blog-tag">{b.tag}</span>

                                <h3>{b.title}</h3>
                                <p className="blog-short">{b.short}</p>

                                <div className="ai-hover-content">
                                    <p>{b.full}</p>
                                    <button>Read Blog →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Awards & Recognition / Certifications */}
            <section className="section awards-section">
                <h2 className="cert-title">Awards & Recognition</h2>
                <p className="cert-subtitle">Certificate of Compliance</p>

                <div className="awards-row">
                    <div className="award-item">
                        <img
                            src="https://www.dolluzcorp.com/wp-content/themes/dolluzcorp/images/hippa.png"
                            alt="HIPAA Compliance"
                        />
                        <span>HIPAA</span>
                    </div>

                    <div className="award-item">
                        <img
                            src="https://www.dolluzcorp.com/wp-content/themes/dolluzcorp/images/9001.png"
                            alt="ISO 9001:2015"
                        />
                        <span>ISO 9001:2015</span>
                    </div>

                    <div className="award-item">
                        <img
                            src="https://www.dolluzcorp.com/wp-content/themes/dolluzcorp/images/27001.png"
                            alt="ISO 27001:2013"
                        />
                        <span>ISO 27001:2013</span>
                    </div>
                </div>

                {/* BIG TEXT BELOW */}
                <div className="cert-description">
                    <p>
                        AT DOLLUZ CORP, WE HIRE DETAIL-ORIENTED RESOURCES WHO STRIVE TO PROVIDE
                        OUR CLIENTS WITH THE BEST ASSISTANCE AND EXPERIENCE.
                    </p>

                    <button
                        className="cert-btn"
                        onClick={() => navigate("/contact")}
                    >
                        Contact Us
                    </button>
                </div>
            </section>

        </div>
    );
};

export default Home;
