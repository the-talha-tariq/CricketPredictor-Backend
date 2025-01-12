const Ranking = require("../models/ranking");

// Get all teams
const getRanking = async (req, res) => {
  try {
    const ranking = await Ranking.find();
    res.status(200).json(ranking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const addTeam = async (req, res) => {
  const { pos, name, played, won, lost, drawn, points, percentagePoints, matchesLeft } = req.body;

  try {
    const newTeam = new Team({ pos, name, played, won, lost, drawn, points, percentagePoints, matchesLeft });
    const savedTeam = await newTeam.save();
    res.status(201).json(savedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a team's data
const updateRanking = async (req, res) => {
  try {
    const updatedRanking = await Ranking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedRanking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRanking, addTeam, updateRanking };
