from bs4 import BeautifulSoup
import requests
import csv

# URL to scrape
url = "https://www.espncricinfo.com/series/icc-world-test-championship-2023-2025-1345943/points-table-standings"

# Send a request and get the HTML content
response = requests.get(url)
if response.status_code != 200:
    print(f"Failed to fetch the page. Status code: {response.status_code}")
    exit()

# Parse the HTML using BeautifulSoup
soup = BeautifulSoup(response.content, "html.parser")

# Find the table rows within the points table
rows = soup.find_all("tr", class_="ds-text-tight-s ds-text-typo-mid2")

# List to store extracted data
points_table = []

# Extract data for each team
for row in rows:
    try:
        # Extract position, team name, and other details
        position = row.find("span", class_="ds-text-tight-xs ds-font-bold ds-w-[14px]").text.strip()
        team_name = row.find("span", class_="ds-text-tight-s ds-font-bold ds-uppercase ds-text-left ds-text-typo").text.strip()

        # Extract other numerical details
        stats = row.find_all("td", class_="ds-w-0 ds-whitespace-nowrap ds-min-w-max")
        matches = stats[0].text.strip()
        wins = stats[1].text.strip()
        losses = stats[2].text.strip()
        draws = stats[3].text.strip()
        no_results = stats[4].text.strip()
        points = stats[6].text.strip()
        #pct = stats[6].text.strip()
        pct = stats[7].text.strip()
        # Extract recent form (W/L/D)
        form = row.find("td", class_="ds-min-w-max ds-cursor-pointer")
        recent_form = "".join([span.text.strip() for span in form.find_all("span", class_="ds-text-tight-xs ds-font-medium ds-text-raw-white")])

        # Append the extracted data
        points_table.append({
            "Position": position,
            "Team": team_name,
            "Matches": matches,
            "Wins": wins,
            "Losses": losses,
            "Draws": draws,
            "No Results": no_results,
            "Points": points,
            "Percentage": pct,
            "Recent Form": recent_form,
        })

    except Exception as e:
        print(f"Error processing row: {e}")

# Save the data to a CSV file
output_file = "world_test_championship_points_table.csv"
with open(output_file, "w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=["Position", "Team", "Matches", "Wins", "Losses", "Draws", "No Results", "Points", "Percentage", "Recent Form"])
    writer.writeheader()
    writer.writerows(points_table)

print(f"Scraped {len(points_table)} rows. Data saved to {output_file}.")
