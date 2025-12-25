const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { addTip, getTips, searchTips, likeTip } = require("../controllers/tipController");

router.post("/", authMiddleware, addTip);
router.get("/", authMiddleware, getTips);
router.get("/search", authMiddleware, searchTips);
router.post("/:id/like", authMiddleware, likeTip);

module.exports = router;
