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
        SELECT *
        FROM dolluzcorp_updates
        WHERE deleted_time IS NULL
        ORDER BY created_time DESC
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
        LEFT JOIN department_config d
            ON p.department_id = d.department_id
        WHERE p.deleted_time IS NULL
        ORDER BY p.created_time DESC
    `;

    db.query(q, (err, rows) => {
        if (err) {
            return res.json({ success: false, devError: err.sqlMessage });
        }
        res.json({ success: true, data: rows });
    });
});

module.exports = router;
