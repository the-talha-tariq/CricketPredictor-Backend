const mongoose = require("mongoose");
const Match = require("../models/match"); // Match model
const Ranking = require("../models/ranking"); // Ranking model

// Function to calculate all scenarios for a specific team
const calculateScenarios = async (teamName) => {
  try {
    // Step 1: Fetch all pending matches and current rankings
    const pendingMatches = await Match.find({ result: "Pending" });
    const rankings = await Ranking.find();
    console.log(pendingMatches[0])
    // Array to store valid scenarios
    const validScenarios = [];

    // Helper function to simulate outcomes recursively
    const simulateOutcomes = (matches, currentRankings, scenario = []) => {

      console.log("Simulating outcome:", {
        match: currentMatch,
        rankings: updatedRankings,
        scenario,
      });
      // Base case: No pending matches left
      if (matches.length === 0) {
        // Sort rankings by points and percentagePoints
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

      // Helper function to update rankings for a match outcome
      const updateRankings = (teamA, teamB, pointsA, pointsB) => {
        const teamARanking = updatedRankings.find(
          (rank) => rank.name === teamA
        );
        const teamBRanking = updatedRankings.find(
          (rank) => rank.name === teamB
        );

        // Update rankings for Team A
        teamARanking.played++;
        teamARanking.points += pointsA;
        if (pointsA === 12) teamARanking.won++;
        else if (pointsA === 4) teamARanking.drawn++;

        // Update rankings for Team B
        teamBRanking.played++;
        teamBRanking.points += pointsB;
        if (pointsB === 12) teamBRanking.won++;
        else if (pointsB === 4) teamBRanking.drawn++;

        // Recalculate percentage points
        teamARanking.percentagePoints =
          (teamARanking.points / (teamARanking.played * 12)) * 100;
        teamBRanking.percentagePoints =
          (teamBRanking.points / (teamBRanking.played * 12)) * 100;
      };

      // Case 1: Team A wins
      updateRankings(currentMatch.teamA, currentMatch.teamB, 12, 0);
      simulateOutcomes(remainingMatches, updatedRankings, [
        ...scenario,
        { match: currentMatch, outcome: `${currentMatch.teamA} wins` },
      ]);

      // Case 2: Team B wins
      updateRankings(currentMatch.teamA, currentMatch.teamB, 0, 12);
      simulateOutcomes(remainingMatches, updatedRankings, [
        ...scenario,
        { match: currentMatch, outcome: `${currentMatch.teamB} wins` },
      ]);

      // Case 3: Draw
      updateRankings(currentMatch.teamA, currentMatch.teamB, 4, 4);
      simulateOutcomes(remainingMatches, updatedRankings, [
        ...scenario,
        { match: currentMatch, outcome: `Draw` },
      ]);
    };

    // Start simulation with all pending matches
    simulateOutcomes(pendingMatches, rankings);

    // Return valid scenarios
    return validScenarios;
  } catch (error) {
    console.error("Error calculating scenarios:", error);
    return [];
  }
};

// Example usage
const runPrediction = async () => {
  const teamName = "South Africa"; // Replace with the desired team name
  const scenarios = await calculateScenarios(teamName);

  console.log(
    `Found ${scenarios.length} valid scenarios where ${teamName} qualifies in the top 2.`
  );

  scenarios.forEach((scenario, index) => {
    console.log(`Scenario ${index + 1}:`);
    scenario.forEach((matchOutcome) => {
      console.log(
        `  Match: ${matchOutcome.match.teamA} vs ${matchOutcome.match.teamB}, Outcome: ${matchOutcome.outcome}`
      );
    });
    console.log();
  });
};

// runPrediction();
