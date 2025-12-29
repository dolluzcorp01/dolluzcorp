import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch, EMP_PROFILE_FILE_BASE } from "./utils/api";
import "./UpdateDetails.css";

const UpdateDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [update, setUpdate] = useState(null);

    useEffect(() => {
        fetchUpdate();
    }, []);

    const fetchUpdate = async () => {
        const res = await apiFetch(`/api/Dolluzcorp/updates/list`);
        const data = await res.json();

        if (data.success) {
            const found = data.data.find(u => u.update_id == id);
            setUpdate(found);
        }
    };

    if (!update) return null;

    return (
        <div className="update-details-container">
            <button className="back-btn" onClick={() => navigate(`/Home`)}>
                ← Back
            </button>

            <h1>{update.title}</h1>
            <h3>{update.subject}</h3>

            <div
                className="update-full-description"
                dangerouslySetInnerHTML={{ __html: update.description }}
            />

            {update.images &&
                update.images.split(",").map((item, i) => {
                    const path = item.includes("::")
                        ? item.split("::")[1]
                        : item;

                    return (
                        <img
                            key={i}
                            src={`${EMP_PROFILE_FILE_BASE}/${path}`}
                            alt="update"
                            className="update-full-image"
                        />
                    );
                })}

            <div className="update-time">
                Last updated: {new Date(update.updated_time).toLocaleString()}
            </div>
        </div>
    );
};

export default UpdateDetails;
