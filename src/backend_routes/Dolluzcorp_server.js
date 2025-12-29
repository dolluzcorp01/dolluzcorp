const express = require("express");
const router = express.Router();
const { verifyJWT } = require("./Login_server");
const getDBConnection = require("../../config/db");

const db = getDBConnection("dadmin");

/* ---------- Banner ---------- */
router.get("/banner/list", verifyJWT, (req, res) => {
    const q = `
        SELECT * FROM dolluzcorp_banners
        ORDER BY display_order ASC
    `;

    db.query(q, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: true, data: rows });
    });
});

/* ---------- Updates and announcements ---------- */
router.get("/updates/list", verifyJWT, (req, res) => {
    const q = `
    SELECT 
    u.*,
    GROUP_CONCAT(CONCAT(i.image_id, '::', i.image_path)
             ORDER BY i.image_id ASC) AS images
    FROM dolluzcorp_updates u
    LEFT JOIN dolluzcorp_update_images i 
        ON u.update_id = i.update_id
    WHERE u.deleted_time IS NULL
    AND (u.display_from IS NULL OR CURDATE() >= u.display_from) 
    AND (u.display_to IS NULL OR CURDATE() <= u.display_to) 
    GROUP BY u.update_id
    ORDER BY u.created_time DESC;
    `;

    db.query(q, (err, rows) => {
        if (err) {
            return res.json({ success: false, devError: err.sqlMessage });
        }
        res.json({ success: true, data: rows });
    });
});

/* ---------- Policies ---------- */
router.get("/policies/list", verifyJWT, (req, res) => {
    const q = `
        SELECT p.*, d.department_name
        FROM dolluzcorp_policies p
        LEFT JOIN department_config d ON p.department_id = d.department_id
        WHERE p.deleted_time IS NULL
       ORDER BY p.display_order ASC, p.created_time DESC
    `;

    db.query(q, (err, rows) => {
        if (err) {
            return res.json({ success: false, devError: err.sqlMessage });
        }
        res.json({ success: true, data: rows });
    });
});

module.exports = router;
