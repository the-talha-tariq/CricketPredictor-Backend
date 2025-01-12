const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  date: { type: Date },
  result: { type: String, default: "Pending" }, // Win/Loss/Draw
});

module.exports = mongoose.model("Match", matchSchema);
