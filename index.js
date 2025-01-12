require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const matchRoute = require("./routes/matchRoute");
const rankingRoute = require("./routes/rankingRoute");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use("/api/matches", matchRoute);
app.use("/api/ranking", rankingRoute);


// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});