import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, EMP_PROFILE_FILE_BASE } from "./utils/api";
import {
    FaHome, FaBell, FaClock, FaUserCog, FaFileAlt, FaHeadset,
    FaBug, FaTimes, FaBellSlash, FaBullhorn, FaCommentDots, FaClipboardList
} from "react-icons/fa";
import logo_eagle from "./assets/img/logo_eagle.png";
import ProfileHeader from "./ProfileHeader.js";
import "./Home.css";

const apps = [
    { name: "dAdmin", description: "Admin controls & configuration", url: "https://dadmin.dolluzcorp.in/Support_Tickets", icon: <FaUserCog /> },
    { name: "dForms", description: "Dynamic form builder system", url: "https://dforms.dolluzcorp.in/home", icon: <FaFileAlt /> },
    { name: "dAssist", description: "Support tickets and helpdesk", url: "https://dassist.dolluzcorp.in/Tickets", icon: <FaHeadset /> },
    { name: "dBug", description: "Bug tracking and issue management", url: "https://dbug.dolluzcorp.in/Tickets", icon: <FaBug /> },
    { name: "dTime", description: "Manage attendance, leave, shifts", url: "https://dtime.dolluzcorp.in/Timesheet_entry", icon: <FaClock /> },
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
            const sorted = data.data.sort(
                (a, b) => a.display_order - b.display_order
            );
            setBanners(sorted);
        }
    };

    const fetchUpdates = async () => {
        const res = await apiFetch("/api/Dolluzcorp/updates/list");
        const data = await res.json();

        if (data.success) {
            setUpdates(data.data);
        }
    };

    const fetchPolicies = async () => {
        const res = await apiFetch("/api/Dolluzcorp/policies/list");
        const data = await res.json();

        if (data.success) {
            setPolicies(data.data);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(e.target)
            ) {
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    notification_ids: [notificationId],
                }),
            });

            const data = await res.json();

            if (data.success) {
                setNotifications(prev =>
                    prev.filter(n => n.notification_id !== notificationId)
                );
            }
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const getPageIndex = (index, itemsPerPage) =>
        Math.floor(index / itemsPerPage);

    const policyTotalPages = Math.ceil(policies.length / POLICIES_PER_PAGE);

    const visiblePolicies = policies.slice(
        policyPage * POLICIES_PER_PAGE,
        policyPage * POLICIES_PER_PAGE + POLICIES_PER_PAGE
    );

    const shuffleArray = (arr) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const totalPages = Math.ceil(updates.length / ITEMS_PER_PAGE);

    const visibleUpdates = updates.slice(
        currentPage * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );

    const nextPage = () => {
        setCurrentPage(prev => (prev + 1 < totalPages ? prev + 1 : prev));
    };

    const prevPage = () => {
        setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
    };

    const nextPolicyPage = () => {
        if (policyPage < policyTotalPages - 1) {
            setPolicyPage(prev => prev + 1);
        }
    };

    const prevPolicyPage = () => {
        if (policyPage > 0) {
            setPolicyPage(prev => prev - 1);
        }
    };

    useEffect(() => {
        setPageColors(shuffleArray(BASE_COLORS));
    }, [currentPage]);

    const getCreatorName = (n, maxLength = 18) => {
        if (!n.created_by_first_name) return "System";

        const fullName = `${n.created_by_first_name} ${n.created_by_last_name || ""}`.trim();

        return fullName.length > maxLength
            ? fullName.slice(0, maxLength) + "..."
            : fullName;
    };

    const handleNotificationClick = (n) => {
        // ✅ Mark as read immediately when clicked 
        //markSingleAsRead(n.notification_id);

        /* ================= MANUAL ================= */
        if (n.notification_type === "MANUAL") {
            setActiveManualNotification(n);
            setShowManualView(true);
            return; // ⛔ stop here (no comparison)
        }

        /* ================= UPDATE ================= */
        if (n.notification_type === "UPDATE") {

            const updateId = Number(n.notification_value); // ✅ FIX

            const index = updates.findIndex(
                u => u.update_id === updateId
            );

            if (index === -1) return;

            const page = getPageIndex(index, ITEMS_PER_PAGE);
            setCurrentPage(page);

            setTimeout(() => {
                updatesRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);

            setTimeout(() => {
                const el = document.querySelector(
                    `[data-update-id="${updateId}"]`
                );

                if (el) {
                    el.classList.add("highlight-card");
                    el.scrollIntoView({ behavior: "smooth", block: "center" });

                    setTimeout(() => {
                        el.classList.remove("highlight-card");
                    }, 2500);
                }
            }, 500);
        }

        /* ================= POLICY ================= */
        if (n.notification_type === "POLICY") {

            const policyId = Number(n.notification_value); // ✅ FIX

            const index = policies.findIndex(
                p => p.policy_id === policyId
            );

            if (index === -1) return;

            const page = getPageIndex(index, POLICIES_PER_PAGE);
            setPolicyPage(page);

            setTimeout(() => {
                policiesRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);

            setTimeout(() => {
                const el = document.querySelector(
                    `[data-policy-id="${policyId}"]`
                );

                if (el) {
                    el.classList.add("highlight-card");
                    el.scrollIntoView({ behavior: "smooth", block: "center" });

                    setTimeout(() => {
                        el.classList.remove("highlight-card");
                    }, 2500);
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

    return (
        <div className="home-container">

            {/* HEADER */}
            <div className="home-header">
                <div className="header-left">
                    {/* BRAND */}
                    <div className="brand-wrapper">
                        <img src={logo_eagle} alt="DolluzCorp Logo" className="brand-logo" />
                        <span className="brand-text">DolluzCorp /</span>
                    </div>

                    <FaHome className="header-icon" />

                </div>

                <div className="header-right">
                    <div className="notification-wrapper" ref={notificationRef}>
                        <FaBell
                            className="header-icon"
                            onClick={() => setShowNotifications(prev => !prev)}
                        />

                        {notifications.length > 0 && (
                            <span className="notification-badge">
                                {notifications.length}
                            </span>
                        )}

                        {showNotifications && (
                            <div className="notification-box">
                                <div className="notification-header">
                                    <span>Notifications</span>
                                    {notifications.length > 0 && (
                                        <span className="notification-count">
                                            {notifications.length}
                                        </span>
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markSingleAsRead(n.notification_id);
                                                    }}
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

                    <ProfileHeader
                        loggedInEmp={loggedInEmp}
                        setLoggedInEmp={setLoggedInEmp}
                    />
                </div>
            </div>

            {showManualView && activeManualNotification && (
                <div
                    className="manual-view-overlay"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="manual-view-box">
                        <div className="manual-view-header">
                            <h4>{activeManualNotification.title}</h4>
                            <button
                                className="manual-view-close"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowManualView(false);
                                }}
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
                <div className="banner-slider">
                    <div className="banner-track">
                        {banners.map((b) => (
                            <img
                                key={b.banner_id}
                                src={`${EMP_PROFILE_FILE_BASE}/${b.banner_image.replace(/\\/g, "/")}`}
                                alt="banner"
                                className="banner-img"
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section
                ref={updatesRef}
                id="updates-section"
                className="section section-updates"
            >
                <h2 className="section-title">Updates & Announcements</h2>

                {/* ARROWS — only if more than 4 updates */}
                {updates.length > ITEMS_PER_PAGE && (
                    <div className="updates-arrows">
                        <button
                            className="arrow-btn"
                            onClick={prevPage}
                            disabled={currentPage === 0}
                        >
                            ‹
                        </button>

                        <button
                            className="arrow-btn"
                            onClick={nextPage}
                            disabled={currentPage === totalPages - 1}
                        >
                            ›
                        </button>
                    </div>
                )}

                <div className="updates-grid flip-grid">
                    {visibleUpdates.map((u, i) => {
                        const colorClass = pageColors[i];

                        return (
                            <div key={u.update_id} className="flip-card" data-update-id={u.update_id}>
                                <div className="flip-inner">

                                    {/* FRONT */}
                                    <div className={`flip-front ${colorClass}`}>
                                        <h3>{u.title}</h3>
                                        <p>{u.subject}</p>
                                        <span>
                                            {new Date(u.updated_time).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* BACK */}
                                    <div className={`flip-back ${colorClass}`}>
                                        <h3>Update Details</h3>
                                        <p>{u.subject}</p>

                                        <button
                                            className="flip-btn"
                                            onClick={() =>
                                                window.open(`/update/${u.update_id}`, "_blank")
                                            }
                                        >
                                            Learn More
                                        </button>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="section section-policies">
                <h2 className="section-title">Policies</h2>

                {/* ARROWS — only if more than 3 policies */}
                {policies.length > POLICIES_PER_PAGE && (
                    <div className="updates-arrows">
                        <button
                            className="arrow-btn"
                            onClick={prevPolicyPage}
                            disabled={policyPage === 0}
                        >
                            ‹
                        </button>

                        <button
                            className="arrow-btn"
                            onClick={nextPolicyPage}
                            disabled={policyPage === policyTotalPages - 1}
                        >
                            ›
                        </button>
                    </div>
                )}

                <div className="policies-grid">
                    {visiblePolicies.map((p) => (
                        <div key={p.policy_id} className="policy-card" data-policy-id={p.policy_id}>
                            <h3>{p.title}</h3>

                            <div
                                className="policy-desc"
                                dangerouslySetInnerHTML={{
                                    __html: p.description
                                }}
                            />

                            {/* LEARN MORE */}
                            <button
                                className="policy-btn"
                                onClick={() =>
                                    window.open(`/policy/${p.policy_id}`, "_blank")
                                }
                            >
                                Learn More
                            </button>
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
