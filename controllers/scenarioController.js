const fs = require("fs");
const path = require("path");
const Match = require("../models/match");
const Ranking = require("../models/ranking");


// Controller to calculate scenarios
const calculateScenarios = async (req, res) => {
  const { teamName } = req.params;

  try {
    // Step 1: Fetch all pending matches and current rankings
    const pendingMatches = await Match.find({ result: "Pending" });
    const rankings = await Ranking.find();
    console.log(pendingMatches.length)
    // Array to store valid scenarios
    const validScenarios = [];

    // Helper function to simulate outcomes recursively
    let scenarioCounter = 0; // Global counter for tracking scenarios

    const simulateOutcomes = (matches, currentRankings, scenario = [], depth = 0) => {
    console.log(
        `Depth: ${depth}, Matches Left: ${matches.length}, Current Scenario Length: ${scenario.length}`
    );

    // Base case: No pending matches left
    if (matches.length === 0) {
        scenarioCounter++; // Increment scenario count
        console.log(`Processing Scenario #${scenarioCounter} out of ${Math.pow(3, pendingMatches.length)}`);

        currentRankings.sort((a, b) =>
        b.points === a.points
            ? b.percentagePoints - a.percentagePoints
            : b.points - a.points
        );

        // Check if the user's team is in the top 2
        if (
        currentRankings[0].name === teamName ||
        currentRankings[1].name === teamName
        ) {
        validScenarios.push([...scenario]); // Save the scenario
        }
        return;
    }

    // Extract the first match from the list
    const [currentMatch, ...remainingMatches] = matches;

    // Clone the rankings to avoid mutating the original array
    const updatedRankings = JSON.parse(JSON.stringify(currentRankings));

    const updateRankings = (teamA, teamB, pointsA, pointsB) => {
        const teamARanking = updatedRankings.find((rank) => rank.name === teamA);
        const teamBRanking = updatedRankings.find((rank) => rank.name === teamB);

        teamARanking.played++;
        teamARanking.points += pointsA;
        if (pointsA === 12) teamARanking.won++;
        else if (pointsA === 4) teamARanking.drawn++;

        teamBRanking.played++;
        teamBRanking.points += pointsB;
        if (pointsB === 12) teamBRanking.won++;
        else if (pointsB === 4) teamBRanking.drawn++;

        teamARanking.percentagePoints =
        (teamARanking.points / (teamARanking.played * 12)) * 100;
        teamBRanking.percentagePoints =
        (teamBRanking.points / (teamBRanking.played * 12)) * 100;
    };

    // Case 1: Team A wins
    const case1Rankings = JSON.parse(JSON.stringify(updatedRankings));
    updateRankings(currentMatch.teamA, currentMatch.teamB, 12, 0);
    simulateOutcomes(remainingMatches, case1Rankings, [
        ...scenario,
        { match: currentMatch, outcome: `${currentMatch.teamA} wins` },
    ], depth + 1);

    // Case 2: Team B wins
    const case2Rankings = JSON.parse(JSON.stringify(updatedRankings));
    updateRankings(currentMatch.teamA, currentMatch.teamB, 0, 12);
    simulateOutcomes(remainingMatches, case2Rankings, [
        ...scenario,
        { match: currentMatch, outcome: `${currentMatch.teamB} wins` },
    ], depth + 1);

    // Case 3: Draw
    const case3Rankings = JSON.parse(JSON.stringify(updatedRankings));
    updateRankings(currentMatch.teamA, currentMatch.teamB, 4, 4);
    simulateOutcomes(remainingMatches, case3Rankings, [
        ...scenario,
        { match: currentMatch, outcome: `Draw` },
    ], depth + 1);
    };
      

    // Start simulation with all pending matches
    simulateOutcomes(pendingMatches, rankings);

    // Save results to a local file
    const resultFilePath = path.join(__dirname, "../results", `${teamName}_scenarios.json`);
    fs.writeFileSync(resultFilePath, JSON.stringify(validScenarios, null, 2), "utf-8");

    // Respond with success and file path
    res.status(200).json({
      message: `Scenarios calculated successfully for ${teamName}.`,
      scenariosFile: resultFilePath,
      scenariosCount: validScenarios.length,
    });
  } catch (error) {
    console.error("Error calculating scenarios:", error);
    res.status(500).json({ error: "Error calculating scenarios" });
  }
};

module.exports = { calculateScenarios };
