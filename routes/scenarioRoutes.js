const express = require("express");
const { calculateScenarios } = require("../controllers/scenarioController");

const router = express.Router();

// Route to calculate scenarios
router.get("/scenarios/:teamName", calculateScenarios);

module.exports = router;
