const express = require("express");
const { getMatches, addMatch, updateMatch } = require("../controllers/matchController");
const router = express.Router();

router.get("/", getMatches);
router.post("/", addMatch);
router.put("/:id", updateMatch);

module.exports = router;
