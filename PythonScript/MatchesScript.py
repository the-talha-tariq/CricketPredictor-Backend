from bs4 import BeautifulSoup
import requests
import csv

# URL to scrape
url = "https://www.espncricinfo.com/series/icc-world-test-championship-2023-2025-1345943/match-schedule-fixtures-and-results"

# Send request and get HTML
response = requests.get(url)
soup = BeautifulSoup(response.content, "html.parser")

# Find all match divs with different class patterns
match_divs = soup.find_all("div", class_=["ds-p-4 hover:ds-bg-ui-fill-translucent", 
                                          "ds-p-4 hover:ds-bg-ui-fill-translucent ds-border-t ds-border-line",
                                          "ds-p-4 hover:ds-bg-ui-fill-translucent ds-border-t ds-border-line ds-bg-ui-fill-translucent-hover"])

# List to store scraped match data
matches = []

# Extract data for each match div
for match in match_divs:
    try:
        # Extract match date
        date = match.find("div", class_="ds-text-compact-xs ds-font-bold ds-w-24").text.strip()
        date = date.replace(" '23"," 2023")
        date = date.replace(" '24"," 2024")
        date = date.replace(" '25"," 2025")
        date = date.replace("Mon","Monday")
        date = date.replace("Tue","Tuesday")
        date = date.replace("Wed","Wednesday")
        date = date.replace("Fri","Friday")
        date = date.replace("Sat","Saturday")
        date = date.replace("Sun","Sunday")
        date = date.replace("Jan"," January")
        date = date.replace("Feb"," February")
        date = date.replace("Mar"," March ")
        date = date.replace("Apr"," April")
        date = date.replace("May"," May")
        date = date.replace("Jun"," June")
        date = date.replace("Jul"," July")
        date = date.replace("Aug"," August")
        date = date.replace("Sep"," September")
        date = date.replace("Oct"," October")
        date = date.replace("Nov"," November")
        date = date.replace("Dec"," December")



        # Extract team names
        teams = match.find_all("p", class_="ds-text-tight-m ds-font-bold ds-capitalize ds-truncate")
        team1 = teams[0].text.strip()
        team2 = teams[1].text.strip()

        # Extract venue
        venue = match.find("div", class_="ds-text-tight-s ds-font-regular ds-truncate ds-text-typo-mid3").text.strip()
        venue = venue.replace("1st Test  â€¢Â ","")
        venue = venue.replace("2nd Test  â€¢Â ","")
        venue = venue.replace("3rd Test  â€¢Â ","")
        venue = venue.replace("4th Test  â€¢Â ","")
        venue = venue.replace("5th Test  â€¢Â ","")


        # Extract result
        result = match.find("p", class_="ds-text-tight-s ds-font-medium ds-line-clamp-2 ds-text-typo").text.strip()

        # Append the extracted data to matches list
        matches.append({
            "Date": date,
            "Team 1": team1,
            "Team 2": team2,
            "Venue": venue,
            "Result": result,
        })
    except Exception as e:
        print(f"Error processing match: {e}")

# Save the matches to a CSV file
output_file = "world_test_championship_matches.csv"
with open(output_file, "w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=["Date", "Team 1", "Team 2", "Venue", "Result"])
    writer.writeheader()
    writer.writerows(matches)

print(f"Scraped {len(matches)} matches. Data saved to {output_file}.")
