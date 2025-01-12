const express = require("express");
const { getRanking, addTeam, updateRanking } = require("../controllers/rankingController");
const router = express.Router();

router.get("/", getRanking);
router.post("/", addTeam);
router.put("/:id", updateRanking);

module.exports = router;
