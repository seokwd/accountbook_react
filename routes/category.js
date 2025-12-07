const express = require("express");
const router = express.Router();
const db = require("../db"); // MySQL 연결

// 모든 카테고리 조회
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Category");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "카테고리 조회 실패" });
  }
});

module.exports = router;
