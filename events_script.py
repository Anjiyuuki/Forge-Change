from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from bs4 import BeautifulSoup
import json
import os
import time

# URLs to visit
urls = [
    "https://www.eventbrite.com/d/sc--greenville/charity-and-causes--events/volunteer-events/?page=1",
    "https://www.eventbrite.com/d/sc--charleston/charity-and-causes--events/volunteer-events/?page=1",
    "https://www.eventbrite.com/d/sc--columbia/charity-and-causes--events/volunteer-events/?page=1",
]

# Initialize the Chrome driver
chrome_service = ChromeService()
driver = webdriver.Chrome(service=chrome_service)

# Container for combined event data
all_event_data = []

# Loop through the URLs
for url in urls:
    # Navigate to the URL
    driver.get(url)

    # Wait for JavaScript to load (adjust the time as needed)
    time.sleep(2)  # Wait for 5 seconds, you can adjust this time

    # Retrieve the updated HTML content
    html_content = driver.page_source

    # Parse the HTML content with BeautifulSoup
    soup = BeautifulSoup(html_content, "html.parser")

    # Find and extract the content of <script type="application/ld+json"> elements
    ld_json_scripts = soup.find_all("script", type="application/ld+json")

    # Extract the content from the found scripts
    event_data = []

    for script in ld_json_scripts:
        script_content = json.loads(script.string)
        if script_content["@type"] == "Event":
            start_date = script_content["startDate"]
            end_date = script_content["endDate"]

            event_info = {
                "name": script_content["name"],
                "city": url.split("--")[1].split("/")[0].capitalize(),  # Extract city from URL
                "startDate": start_date,
                "endDate": end_date,
                "date": start_date if start_date == end_date else f"{start_date} - {end_date}",
                "url": script_content["url"],
                "location": script_content["location"],
                "address": script_content["location"]["address"],
                "description": script_content["description"],
                "position": {
                    "lat": float(script_content["location"]["geo"]["latitude"]),
                    "lng": float(script_content["location"]["geo"]["longitude"]),
                },
            }
            event_data.append(event_info)

    # Combine the event data for all URLs
    all_event_data.extend(event_data)

# Close the browser
driver.quit()

# Save the combined data to events_info.json
with open("events_info.json", "w", encoding="utf-8") as json_file:
    json.dump(all_event_data, json_file, ensure_ascii=False, indent=4)
