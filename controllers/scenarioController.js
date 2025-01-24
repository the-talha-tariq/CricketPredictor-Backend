const fs = require("fs");
const path = require("path");
const Match = require("../models/match");
const Ranking = require("../models/ranking");

const generateHtmlReport = (scenarios, teamName) => {
  let htmlContent = `
    <html>
    <head>
        <title>${teamName} Scenarios</title>
        <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px 12px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
    </head>
    <body>
        <h1>Scenarios for ${teamName}</h1>
        <table>
            <thead>
                <tr>
                    <th>Scenario #</th>
                    <th>Matches and Outcomes</th>
                    <th>Final Rankings</th>
                </tr>
            </thead>
            <tbody>
  `;

  scenarios.forEach((scenario, index) => {
    const matchOutcomes = scenario.scenario
      .map(match => `${match.match.teamA} vs ${match.match.teamB}: ${match.outcome}`)
      .join("<br>");

    const finalRankings = scenario.rankings
      .map(rank => `${rank.name} - Points: ${rank.points}, Percentage: ${rank.percentagePoints.toFixed(2)}%`)
      .join("<br>");

    htmlContent += `
      <tr>
          <td>${index + 1}</td>
          <td>${matchOutcomes}</td>
          <td>${finalRankings}</td>
      </tr>
    `;
  });

  htmlContent += `
            </tbody>
        </table>
    </body>
    </html>
  `;

  return htmlContent;
};

const calculateScenarios = async (req, res) => {
  const { teamName } = req.params; // Dynamically using the team name from the request

  try {
    // Fetch all pending matches and current rankings
    const pendingMatches = await Match.find({ result: "Pending" });
    const rankings = await Ranking.find();
    console.log(pendingMatches.length);
    
    // File path for saving the HTML report
    const resultFilePath = path.join(__dirname, "../results", `${teamName}_scenarios_report.html`);
    
    // Array to store valid scenarios
    let validScenarios = [];

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
    
        // Sort the rankings based on percentage points first, then points (for tie-breaker)
        currentRankings.sort((a, b) =>
          b.percentagePoints === a.percentagePoints
            ? b.points - a.points // If percentage is the same, use points as a tie-breaker
            : b.percentagePoints - a.percentagePoints
        );
    
        // Log the final rankings for debugging
        console.log("Final Rankings for Scenario", scenarioCounter, currentRankings);
    
        // Check if the requested team (teamName) is in the top 2
        if (
          currentRankings[0].name === teamName || 
          currentRankings[1].name === teamName
        ) {
          // Push the scenario to validScenarios
          validScenarios.push({
            teamName,
            scenario: [...scenario], // Scenario with matches and outcomes
            rankings: currentRankings // Include the final rankings as well
          });
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
    
        // Update points and matches played for both teams
        teamARanking.played++;
        teamARanking.points += pointsA;
        if (pointsA === 12) teamARanking.won++;
        else if (pointsA === 4) teamARanking.drawn++;
    
        teamBRanking.played++;
        teamBRanking.points += pointsB;
        if (pointsB === 12) teamBRanking.won++;
        else if (pointsB === 4) teamBRanking.drawn++;
    
        // Update percentage points for both teams
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
      // const case3Rankings = JSON.parse(JSON.stringify(updatedRankings));
      // updateRankings(currentMatch.teamA, currentMatch.teamB, 4, 4);
      // simulateOutcomes(remainingMatches, case3Rankings, [
      //   ...scenario,
      //   { match: currentMatch, outcome: `Draw` },
      // ], depth + 1);
    };
    
    // Start simulation with all pending matches
    simulateOutcomes(pendingMatches, rankings);

    // Generate the HTML report
    const htmlReport = generateHtmlReport(validScenarios, teamName);

    // Write the HTML report to a file
    fs.writeFileSync(resultFilePath, htmlReport);

    // Respond with success and file path
    res.status(200).json({
      message: `Scenarios calculated successfully for ${teamName}.`,
      reportFile: resultFilePath,
      scenariosCount: validScenarios.length,
    });
  } catch (error) {
    console.error("Error calculating scenarios:", error);
    res.status(500).json({ error: "Error calculating scenarios" });
  }
};

module.exports = { calculateScenarios };
