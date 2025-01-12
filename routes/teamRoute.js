const express = require("express");
const { getTeams, addTeam, updateTeam } = require("../controllers/teamController");
const router = express.Router();

router.get("/", getTeams);
router.post("/", addTeam);
router.put("/:id", updateTeam);

module.exports = router;
