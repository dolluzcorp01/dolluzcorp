import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, EMP_PROFILE_FILE_BASE } from "./utils/api";
import {
    FaHome, FaBell, FaClock, FaUserCog, FaFileAlt, FaHeadset,
    FaBug, FaTimes, FaBellSlash, FaBullhorn, FaCommentDots,
    FaClipboardList, FaExternalLinkAlt
} from "react-icons/fa";
import logo_eagle from "./assets/img/logo_eagle.png";
import ProfileHeader from "./ProfileHeader.js";
import "./Home.css";

const apps = [
    { name: "dAdmin", description: "Admin controls & configuration", url: "https://dadmin.dolluzcorp.in/Support_Tickets", icon: <FaUserCog />, color: "#06B6D4", bg: "#ECFEFF", tag: "Admin" },
    { name: "dForms", description: "Dynamic form builder system", url: "https://dforms.dolluzcorp.in/home", icon: <FaFileAlt />, color: "#8B5CF6", bg: "#F5F3FF", tag: "Forms" },
    { name: "dAssist", description: "Support tickets and helpdesk", url: "https://dassist.dolluzcorp.in/Tickets", icon: <FaHeadset />, color: "#10B981", bg: "#ECFDF5", tag: "Support" },
    { name: "dBug", description: "Bug tracking and issue management", url: "https://dbug.dolluzcorp.in/Tickets", icon: <FaBug />, color: "#F59E0B", bg: "#FFFBEB", tag: "Bugs" },
    { name: "dTime", description: "Manage attendance, leave, shifts", url: "https://dtime.dolluzcorp.in/Timesheet_entry", icon: <FaClock />, color: "#F43F5E", bg: "#FFF1F2", tag: "Time" },
];

const blogs = [
    { id: 1, title: "How DolluzCorp Built dForms", short: "Architecture & design decisions behind our dynamic form builder.", full: "A deep dive into how we designed scalable forms using React and Node.", tag: "Engineering" },
    { id: 2, title: "Why Automation Matters in Enterprises", short: "How automation reduces cost and increases productivity.", full: "We explore real-world use cases of automation inside DolluzCorp.", tag: "Automation" },
    { id: 3, title: "Building dAssist: Helpdesk at Scale", short: "Challenges faced while creating a multi-tenant support system.", full: "Learn how dAssist handles thousands of tickets efficiently.", tag: "Support" },
    { id: 4, title: "Security First: Our Auth Strategy", short: "JWT, cookies, and role-based access explained.", full: "Security architecture behind DolluzCorp applications.", tag: "Security" },
    { id: 5, title: "UI/UX Decisions That Worked", short: "Small UI decisions that created big impact.", full: "Lessons learned from user feedback and iteration.", tag: "Design" },
    { id: 6, title: "Scaling DolluzCorp Apps", short: "From single server to scalable architecture.", full: "How we optimized performance across all dApps.", tag: "Scalability" }
];

const Home = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [offset, setOffset] = useState(0);
    const [active, setActive] = useState(null);
    const carouselRef = useRef(null);
    const trackRef = useRef(null);
    const [loggedInEmp, setLoggedInEmp] = useState(null);
    const [banners, setBanners] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [policies, setPolicies] = useState([]);
    const ITEMS_PER_PAGE = 4;
    const BASE_COLORS = ["color-1", "color-2", "color-3", "color-4"];
    const POLICIES_PER_PAGE = 3;
    const [policyPage, setPolicyPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageColors, setPageColors] = useState(BASE_COLORS);
    const notificationRef = useRef();
    const updatesRef = useRef(null);
    const policiesRef = useRef(null);
    const [showManualView, setShowManualView] = useState(false);
    const [activeManualNotification, setActiveManualNotification] = useState(null);

    useEffect(() => {
        fetchloginedEmployees(); fetchNotifications(); fetchBanners(); fetchUpdates(); fetchPolicies();
    }, []);

    const fetchloginedEmployees = async () => {
        try {
            const res = await apiFetch(`/api/employee/logined_employee`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();
            setLoggedInEmp(data[0]);
            if (data?.message === "Access Denied. No Token Provided!" || data?.message === "Invalid Token") {
                navigate("/login");
                return;
            }
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    };

    const fetchNotifications = async () => {
        const res = await apiFetch("/api/employee/notifications/list");
        const data = await res.json();
        if (data.success) setNotifications(data.data);
    };

    const fetchBanners = async () => {
        const res = await apiFetch("/api/Dolluzcorp/banner/list");
        const data = await res.json();
        if (data.success) {
            const sorted = data.data.sort((a, b) => a.display_order - b.display_order);
            setBanners(sorted);
        }
    };

    const fetchUpdates = async () => {
        const res = await apiFetch("/api/Dolluzcorp/updates/list");
        const data = await res.json();
        if (data.success) setUpdates(data.data);
    };

    const fetchPolicies = async () => {
        const res = await apiFetch("/api/Dolluzcorp/policies/list");
        const data = await res.json();
        if (data.success) setPolicies(data.data);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markSingleAsRead = async (notificationId) => {
        try {
            const res = await apiFetch("/api/employee/notifications/mark-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notification_ids: [notificationId] }),
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
            }
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const getPageIndex = (index, itemsPerPage) => Math.floor(index / itemsPerPage);

    const policyTotalPages = Math.ceil(policies.length / POLICIES_PER_PAGE);
    const visiblePolicies = policies.slice(policyPage * POLICIES_PER_PAGE, policyPage * POLICIES_PER_PAGE + POLICIES_PER_PAGE);

    const shuffleArray = (arr) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const totalPages = Math.ceil(updates.length / ITEMS_PER_PAGE);
    const visibleUpdates = updates.slice(currentPage * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

    const nextPage = () => setCurrentPage(prev => (prev + 1 < totalPages ? prev + 1 : prev));
    const prevPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
    const nextPolicyPage = () => { if (policyPage < policyTotalPages - 1) setPolicyPage(prev => prev + 1); };
    const prevPolicyPage = () => { if (policyPage > 0) setPolicyPage(prev => prev - 1); };

    useEffect(() => { setPageColors(shuffleArray(BASE_COLORS)); }, [currentPage]);

    const getCreatorName = (n, maxLength = 18) => {
        if (!n.created_by_first_name) return "System";
        const fullName = `${n.created_by_first_name} ${n.created_by_last_name || ""}`.trim();
        return fullName.length > maxLength ? fullName.slice(0, maxLength) + "..." : fullName;
    };

    const handleNotificationClick = (n) => {
        if (n.notification_type === "MANUAL") {
            setActiveManualNotification(n);
            setShowManualView(true);
            return;
        }

        if (n.notification_type === "UPDATE") {
            const updateId = Number(n.notification_value);
            const index = updates.findIndex(u => u.update_id === updateId);
            if (index === -1) return;
            const page = getPageIndex(index, ITEMS_PER_PAGE);
            setCurrentPage(page);
            setTimeout(() => { updatesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
            setTimeout(() => {
                const el = document.querySelector(`[data-update-id="${updateId}"]`);
                if (el) {
                    el.classList.add("highlight-card");
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => el.classList.remove("highlight-card"), 2500);
                }
            }, 500);
        }

        if (n.notification_type === "POLICY") {
            const policyId = Number(n.notification_value);
            const index = policies.findIndex(p => p.policy_id === policyId);
            if (index === -1) return;
            const page = getPageIndex(index, POLICIES_PER_PAGE);
            setPolicyPage(page);
            setTimeout(() => { policiesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
            setTimeout(() => {
                const el = document.querySelector(`[data-policy-id="${policyId}"]`);
                if (el) {
                    el.classList.add("highlight-card");
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => el.classList.remove("highlight-card"), 2500);
                }
            }, 500);
        }
    };

    const handleMouseMove = (e) => {
        if (!carouselRef.current || !trackRef.current) return;
        const container = carouselRef.current;
        const track = trackRef.current;
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const percentage = mouseX / rect.width;
        const maxScroll = track.scrollWidth - container.clientWidth;
        const translateX = -Math.min(Math.max(percentage * maxScroll, 0), maxScroll);
        setOffset(translateX);
    };

    const handleMouseLeave = () => { setOffset(0); setActive(null); };

    return (
        <div className="home-container">

            {/* ── HEADER ── */}
            <div className="home-header">
                <div className="header-left">
                    <div className="brand-wrapper">
                        <img src={logo_eagle} alt="DolluzCorp Logo" className="brand-logo" />
                        <span className="brand-text">DolluzCorp<span className="brand-dot">.</span></span>
                    </div>
                </div>

                <div className="header-right">
                    <div className="notification-wrapper" ref={notificationRef}>
                        <button
                            className={`notification-bell-btn${showNotifications ? " open" : ""}`}
                            onClick={() => setShowNotifications(prev => !prev)}
                        >
                            <FaBell />
                            {notifications.length > 0 && (
                                <span className="notification-badge">{notifications.length}</span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="notification-box">
                                <div className="notification-header">
                                    <span>Notifications</span>
                                    {notifications.length > 0 && (
                                        <span className="notification-count">{notifications.length}</span>
                                    )}
                                </div>

                                <div className="notification-list">
                                    {notifications.length === 0 ? (
                                        <div className="notification-empty">
                                            <FaBellSlash />
                                            <p>No new notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div
                                                key={n.notification_id}
                                                className="notification-item"
                                                onClick={() => handleNotificationClick(n)}
                                            >
                                                <div className="notification-icon">
                                                    {{
                                                        UPDATE: <FaBullhorn />,
                                                        POLICY: <FaClipboardList />,
                                                        MANUAL: <FaCommentDots />
                                                    }[n.notification_type] || <FaCommentDots />}
                                                </div>

                                                <div className="notification-content">
                                                    <p className="notification-title">{n.title}</p>
                                                    <span className="notification-time">
                                                        {new Date(n.created_time).toLocaleString()}
                                                    </span>
                                                </div>

                                                <button
                                                    className="notification-close"
                                                    onClick={(e) => { e.stopPropagation(); markSingleAsRead(n.notification_id); }}
                                                    aria-label="Dismiss notification"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <ProfileHeader loggedInEmp={loggedInEmp} setLoggedInEmp={setLoggedInEmp} />
                </div>
            </div>

            {/* ── MANUAL NOTIFICATION MODAL ── */}
            {showManualView && activeManualNotification && (
                <div className="manual-view-overlay" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="manual-view-box">
                        <div className="manual-view-header">
                            <h4>{activeManualNotification.title}</h4>
                            <button
                                className="manual-view-close"
                                onClick={(e) => { e.stopPropagation(); setShowManualView(false); }}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="manual-view-body">
                            <p>{activeManualNotification.notification_value}</p>
                        </div>
                        <div className="manual-view-footer">
                            <span>
                                From <strong>{getCreatorName(activeManualNotification)}</strong>
                                {" • "}
                                {new Date(activeManualNotification.created_time).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── HERO SECTION ── */}
            <section className="intro-section">
                <div className="intro-left">
                    <span className="intro-badge">Innovating Enterprise Solutions</span>

                    <h1 className="intro-title">
                        Empowering the <br />
                        <span>Modern Workforce</span>
                    </h1>

                    <p className="intro-description">
                        DolluzCorp provides a seamless, integrated ecosystem of
                        dApps designed to streamline your daily operations,
                        from HR to development and beyond.
                    </p>

                    <div className="intro-stats">
                        <div><h3>5+</h3><span>dApps</span></div>
                        <div><h3>100+</h3><span>Employees</span></div>
                        <div><h3>99.9%</h3><span>Uptime</span></div>
                    </div>
                </div>

                <div className="intro-right">
                    <div className="banner-slider">
                        <div className="banner-track">
                            {[...banners, ...banners].map((b, index) => (
                                <img
                                    key={index}
                                    src={`${EMP_PROFILE_FILE_BASE}/${b.banner_image.replace(/\\/g, "/")}`}
                                    alt="banner"
                                    className="banner-img"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── DAPPS SECTION ── */}
            <section className="section section-apps">
                <div className="section-header">
                    <div className="section-header-left">
                        <span className="section-eyebrow">Applications</span>
                        <h2 className="section-title">Our dApps</h2>
                    </div>
                </div>

                <div className="apps-grid">
                    {apps.map((app, index) => (
                        <div
                            key={index}
                            className="app-card"
                            onClick={() => window.open(app.url, "_blank")}
                        >
                            <div className="app-card-top">
                                <div
                                    className="app-icon"
                                    style={{
                                        background: app.bg,
                                        color: app.color,
                                        border: `1.5px solid ${app.color}22`
                                    }}
                                >
                                    {app.icon}
                                </div>
                                <span
                                    className="app-tag"
                                    style={{ background: app.bg, color: app.color }}
                                >
                                    {app.tag}
                                </span>
                            </div>

                            <div className="app-info">
                                <h2>{app.name}</h2>
                                <p>{app.description}</p>
                            </div>

                            <button
                                className="app-launch-btn"
                                style={{
                                    background: `linear-gradient(135deg, ${app.color}, ${app.color}cc)`,
                                    boxShadow: `0 4px 14px ${app.color}35`
                                }}
                            >
                                Launch <FaExternalLinkAlt style={{ fontSize: 11 }} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── UPDATES SECTION ── */}
            <section ref={updatesRef} id="updates-section" className="section section-updates">
                <div className="section-header">
                    <div className="section-header-left">
                        <span className="section-eyebrow">Latest</span>
                        <h2 className="section-title">Updates & Announcements</h2>
                    </div>

                    {updates.length > ITEMS_PER_PAGE && (
                        <div className="updates-arrows" style={{ margin: 0 }}>
                            <button className="arrow-btn" onClick={prevPage} disabled={currentPage === 0}>‹</button>
                            <button className="arrow-btn" onClick={nextPage} disabled={currentPage === totalPages - 1}>›</button>
                        </div>
                    )}
                </div>

                {updates.length === 0 ? (
                    <div className="updates-empty">
                        <span className="empty-icon">📭</span>
                        <h3>No Updates Yet</h3>
                        <p>You're all caught up. New announcements will appear here once available.</p>
                    </div>
                ) : (
                    <div className="updates-grid">
                        {visibleUpdates.map((u, i) => {
                            const colorClass = pageColors[i];
                            return (
                                <div
                                    key={u.update_id}
                                    className={`update-card ${colorClass}`}
                                    data-update-id={u.update_id}
                                >
                                    <div className="update-card-bar" />
                                    <div className="update-card-body">
                                        <div className="update-meta">
                                            <span className="update-tag-chip">Update</span>
                                            <span className="update-date">
                                                {new Date(u.updated_time).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3>{u.title}</h3>
                                        <p>{u.subject}</p>
                                        <button
                                            className="update-read-btn"
                                            onClick={() => window.open(`/update/${u.update_id}`, "_blank")}
                                        >
                                            Read more →
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── POLICIES SECTION ── */}
            <section className="section section-policies" ref={policiesRef}>
                <div className="section-header">
                    <div className="section-header-left">
                        <span className="section-eyebrow">Compliance</span>
                        <h2 className="section-title">Policies</h2>
                    </div>

                    {policies.length > POLICIES_PER_PAGE && (
                        <div className="updates-arrows" style={{ margin: 0 }}>
                            <button className="arrow-btn" onClick={prevPolicyPage} disabled={policyPage === 0}>‹</button>
                            <button className="arrow-btn" onClick={nextPolicyPage} disabled={policyPage === policyTotalPages - 1}>›</button>
                        </div>
                    )}
                </div>

                <div className="policies-grid">
                    {visiblePolicies.map((p) => (
                        <div key={p.policy_id} className="policy-card" data-policy-id={p.policy_id}>
                            <h3>{p.title}</h3>

                            <div
                                className="policy-desc"
                                dangerouslySetInnerHTML={{ __html: p.description }}
                            />

                            <button
                                className="policy-btn"
                                onClick={() => window.open(`/policy/${p.policy_id}`, "_blank")}
                            >
                                Learn More →
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── BLOGS SECTION ── */}
            <section className="section section-blogs">
                <div className="section-header">
                    <div className="section-header-left">
                        <span className="section-eyebrow">Knowledge</span>
                        <h2 className="section-title">Blogs</h2>
                        <p className="section-subtitle">Insights, architecture, and product stories from DolluzCorp</p>
                    </div>
                </div>

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
                                className={`ai-card${active === i ? " active" : ""}`}
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

            {/* ── AWARDS SECTION ── */}
            <section className="section awards-section">
                <h2 className="cert-title">Awards & Recognition</h2>
                <p className="cert-subtitle">Certificate of Compliance</p>

                <div className="awards-row">
                    <div className="award-item">
                        <img src="https://www.dolluzcorp.com/wp-content/themes/dolluzcorp/images/hippa.png" alt="HIPAA Compliance" />
                        <span>HIPAA</span>
                    </div>
                    <div className="award-item">
                        <img src="https://www.dolluzcorp.com/wp-content/themes/dolluzcorp/images/9001.png" alt="ISO 9001:2015" />
                        <span>ISO 9001:2015</span>
                    </div>
                    <div className="award-item">
                        <img src="https://www.dolluzcorp.com/wp-content/themes/dolluzcorp/images/27001.png" alt="ISO 27001:2013" />
                        <span>ISO 27001:2013</span>
                    </div>
                </div>

                <div className="cert-description">
                    <p>
                        AT DOLLUZ CORP, WE HIRE DETAIL-ORIENTED RESOURCES WHO STRIVE TO PROVIDE
                        OUR CLIENTS WITH THE BEST ASSISTANCE AND EXPERIENCE.
                    </p>
                    <button className="cert-btn" onClick={() => navigate("/contact")}>
                        Contact Us
                    </button>
                </div>
            </section>

        </div>
    );
};

export default Home;
