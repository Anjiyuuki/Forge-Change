from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from bs4 import BeautifulSoup
import json

# Initialize the Chrome driver
chrome_service = ChromeService()
driver = webdriver.Chrome(service=chrome_service)

# Navigate to the URL
url = "https://www.eventbrite.com/d/sc--charleston/charity-and-causes--events/volunteer-events/?page=1"
driver.get(url)

# Wait for JavaScript to load (adjust the time as needed)
import time
time.sleep(5)  # Wait for 5 seconds, you can adjust this time

# Retrieve the updated HTML content
html_content = driver.page_source

# Close the browser
driver.quit()

# Parse the HTML content with BeautifulSoup
soup = BeautifulSoup(html_content, "html.parser")

# Find and extract the content of <script type="application/ld+json"> elements
ld_json_scripts = soup.find_all("script", type="application/ld+json")

# Extract the content from the found scripts
event_data = []

for script in ld_json_scripts:
    script_content = json.loads(script.string)
    if script_content["@type"] == "Event":
        event_info = {
            "name": script_content["name"],
            "date": script_content["startDate"]
            if script_content["startDate"] == script_content["endDate"]
            else f"{script_content['startDate']} - {script_content['endDate']}",
            "url": script_content["url"],
            "img": script_content["image"],
            "streetAddress": script_content["location"]["address"]["streetAddress"],
            "description": script_content["description"],
        }
        event_data.append(event_info)

# Save the extracted event data to a JSON file
with open("event_info.json", "w", encoding="utf-8") as json_file:
    json.dump(event_data, json_file, ensure_ascii=False, indent=4)

print("Event data saved to 'event_info.json'")