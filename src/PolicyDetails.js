import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "./utils/api";
import "./PolicyDetails.css";

const PolicyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [policy, setPolicy] = useState(null);

    useEffect(() => {
        fetchPolicy();
    }, []);

    const fetchPolicy = async () => {
        const res = await apiFetch("/api/Dolluzcorp/policies/list");
        const data = await res.json();

        if (data.success) {
            const found = data.data.find(p => p.policy_id == id);
            console.log(found);
            setPolicy(found);
        }
    };

    if (!policy) return null;

    return (
        <div className="policy-details-container">
            <button className="back-btn" onClick={() => navigate("/home")}>
                ← Back
            </button>

            <h1>{policy.title}</h1>
 
            <div
                className="policy-full-description"
                dangerouslySetInnerHTML={{ __html: policy.description }}
            />

            <div className="policy-time">
                Last updated:{" "}
                {new Date(policy.updated_time || policy.created_time).toLocaleString()}
            </div>
        </div>
    );
};

export default PolicyDetails;
