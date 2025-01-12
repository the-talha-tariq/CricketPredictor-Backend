const mongoose = require("mongoose");

const rankingchema = new mongoose.Schema({
  pos: { type: String, required: true },
  name: { type: String, required: true },
  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  drawn: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  percentagePoints: { type: Number, default: 0 },
  matchesLeft: { type: Number, default: 0 },
});

module.exports = mongoose.model("Ranking", rankingchema);
