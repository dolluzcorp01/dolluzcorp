const express = require("express");
const router = express.Router(); 
const { verifyJWT } = require("./Login_server");
const getDBConnection = require("../../config/db");

const db = getDBConnection("dadmin");
 
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
 
module.exports = router;
