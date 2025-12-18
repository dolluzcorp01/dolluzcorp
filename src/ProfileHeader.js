import React, { useState, useRef, useEffect } from "react";
import { FaCamera, FaSignOutAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { apiFetch } from "./utils/api";
import { createPortal } from "react-dom";
import help_desk from "./assets/img/help_desk.png";
import "./ProfileHeader.css";

const MAX_FILE_SIZE = 0.5 * 1024 * 1024;

const ProfileHeader = ({ loggedInEmp, setLoggedInEmp }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);
    const modalRef = useRef(null);

    const handleLogout = async () => {
        await apiFetch(`/api/login/logout`, {
            method: "POST",
            credentials: "include",
        });
        window.location.href = "/login";
    };

    const handleCopyEmail = (email) => {
        navigator.clipboard.writeText(email)
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Copied!',
                    text: `${email} has been copied to clipboard`,
                    timer: 1500,
                    showConfirmButton: false
                });
            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Failed to copy email!'
                });
            });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            Swal.fire("File Too Large", "Max size is 0.5 MB", "warning");
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
    };

    const handleSaveProfileImage = async () => {
        const formData = new FormData();
        formData.append("profile", selectedFile);

        try {
            const res = await apiFetch(`/api/employee/upload-profile`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            const data = await res.json();

            setLoggedInEmp(prev => ({ ...prev, emp_profile_img: data.profilePath }));
            setIsModalOpen(false);
            setSelectedFile(null);

            Swal.fire("Success", "Profile updated", "success");
        } catch {
            Swal.fire("Error", "Upload failed", "error");
        }
    };

    return (
        <>
            <div className="profile-header-wrapper">
                {/* SMALL AVATAR IN HEADER */}
                <div
                    className="profile-avatar"
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    style={{
                        backgroundColor: loggedInEmp?.profile_color,
                        backgroundImage: loggedInEmp?.emp_profile_img
                            ? `url(${loggedInEmp.emp_profile_img})`
                            : undefined
                    }}
                >
                    {!loggedInEmp?.emp_profile_img && loggedInEmp?.profile_letters}
                </div>

                {/* DROPDOWN */}
                {isDropdownOpen && (
                    <div className="profile-dropdown" ref={dropdownRef}>
                        {/* PROFILE TOP */}
                        <div className="dropdown-profile">
                            <div
                                className="dropdown-avatar"
                                style={{
                                    backgroundColor: loggedInEmp?.emp_profile_img
                                        ? "transparent"
                                        : loggedInEmp?.profile_color,
                                    backgroundImage: loggedInEmp?.emp_profile_img
                                        ? `url(${loggedInEmp.emp_profile_img})`
                                        : undefined
                                }}
                            >
                                {loggedInEmp?.emp_profile_img ? (
                                    /* If image exists → nothing inside (image is background) */
                                    null
                                ) : (
                                    /* If NO image → show camera icon */
                                    <FaCamera
                                        size={18}
                                        color="white"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setIsModalOpen(true)}
                                    />
                                )}
                            </div>

                            <div>
                                <strong style={{ color: "#fff" }}>
                                    {loggedInEmp?.emp_first_name} {loggedInEmp?.emp_last_name}
                                </strong>
                                <div style={{ fontSize: "12px", color: "#9ca3af", fontStyle: "italic" }}>
                                    Your Form, Your Space
                                </div>
                            </div>
                        </div>

                        {/* HELP EMAIL */}
                        <div
                            className="dropdown-item"
                            onClick={() => handleCopyEmail("Help@dFroms.io")}
                        >
                            <img src={help_desk} alt="Help Desk" />
                            info@dolluzcorp.com
                        </div>

                        {/* CHANGE PASSWORD */}
                        <div
                            className="dropdown-item"
                            onClick={() => (window.location.href = "/login?changePassword")}
                        >
                            <i className="fa fa-key"></i>
                            Change Password
                        </div>

                        <div className="dropdown-divider" />

                        {/* LOGOUT */}
                        <div className="dropdown-item logout" onClick={handleLogout}>
                            <FaSignOutAlt />
                            Logout
                        </div>
                    </div>
                )}
                
                {isModalOpen &&
                    createPortal(
                        <div className="profile-modal-overlay">
                            <div className="profile-modal" ref={modalRef}>
                                <button
                                    className="profile-modal-close"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    ✖
                                </button>

                                <h3 className="profile-modal-title">Update Profile Image</h3>

                                <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                                    {selectedFile ? (
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Preview"
                                            className="profile-image-preview"
                                        />
                                    ) : (
                                        <FaCamera size={60} color="#555" />
                                    )}
                                </div>

                                <div style={{ position: "relative", width: "100%" }}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ width: "100%", paddingRight: selectedFile ? "30px" : "0" }}
                                    />

                                    {selectedFile && (
                                        <span
                                            onClick={() => {
                                                setSelectedFile(null);
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                            style={{
                                                position: "absolute",
                                                right: "8px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                cursor: "pointer",
                                                fontSize: "16px",
                                                color: "#888",
                                            }}
                                        >
                                            ✖
                                        </span>
                                    )}
                                </div>

                                <div className="profile-modal-buttons">
                                    <button
                                        className="profile-modal-save"
                                        onClick={handleSaveProfileImage}
                                        disabled={!selectedFile}
                                        style={{
                                            cursor: selectedFile ? "pointer" : "not-allowed",
                                            opacity: selectedFile ? 1 : 0.5
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )
                }
            </div>
        </>
    );

};

export default ProfileHeader;
