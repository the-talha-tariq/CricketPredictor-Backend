const Match = require("../models/match");

// Get all matches
const getMatches = async (req, res) => {
  try {
    const matches = await Match.find();
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new match
const addMatch = async (req, res) => {
  const { teamA, teamB, date, result } = req.body;

  try {
    const newMatch = new Match({ teamA, teamB, date, result });
    const savedMatch = await newMatch.save();
    res.status(201).json(savedMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update match result
const updateMatch = async (req, res) => {
  try {
    const updatedMatch = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMatches, addMatch, updateMatch };
