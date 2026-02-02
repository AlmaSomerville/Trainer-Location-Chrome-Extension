# Trainer-Location-Chrome-Extension
Location-based trainer finder that calculates real distances, checks live availability from Google Sheets, and returns the nearest open options with one-click Google Maps directions.

# Trainer Locator & Availability Finder

This project is a small location-based web app / Chrome extension that helps sales teams quickly find the nearest available trainer based on a customer’s ZIP code.

I built it to solve a real internal workflow problem and to practice working with real-world data, browser APIs, and geographic calculations.

---

## What the App Does

- Takes a 5-digit US ZIP code (entered manually or detected from the current page (in this case HubSpot))
- Converts the ZIP code into latitude and longitude
- Calculates distances to hard coded trainers using geographic coordinates
- Loads trainer availability from a CSV published via Google Sheets
- Finds the next available date for each trainer
- Displays the nearest trainers along with distance and Google Maps directions

---

## Why I Built This

This tool was originally built for a sales team where most operational data lived in Google Sheets.

Before this app, the process looked like this:
1. Open a spreadsheet to find trainer locations
2. Copy a trainer address into Google Maps
3. Copy the customer location from HubSpot
4. Paste that into Google Maps to estimate distance
5. Open a second spreadsheet to check trainer availability

This was slow, repetitive, and easy to get wrong.

The goal of this project was to reduce that entire process to a single lookup:
- One ZIP code
- One list of nearby trainers
- Availability visible immediately
- One-click directions when needed

---

## Design Decisions

### Hard-coded trainer locations
Trainer location data is hard-coded in the app rather than loaded from a spreadsheet.

This was a deliberate choice: loading the trainer “phone book” from Google Sheets caused a noticeable delay (1–3 seconds) in the Chromium extension popup. Hard-coding this data made the UI feel instant and more reliable allowing the availability to drop a few seconds later.

Availability data, which changes frequently, is still loaded dynamically.

### Distance calculation
Distance calculations use the Haversine formula, for calculating distances between two geographic coordinates.  
The implementation is based on common public examples and adapted for this project.

### CSV parsing
PapaParse is used for CSV parsing. The library is included directly and used as-is rather than reimplemented.

---

## How It Works

1. On click of the extension, the popup reads the zip code from hubspot automatically or user provides a ZIP code via text box entry
2. The ZIP code is resolved to a location (with basic caching to reduce repeat requests)
3. Distances to trainers are calculated using the Haversine formula
4. Availability data is fetched and parsed from a CSV file
5. Each trainer is matched to their next available slot
6. Results are sorted by distance and displayed with Google Maps directions

---

## Tech Used

- JavaScript (ES6+)
- Chrome Extension APIs
- Google Sheets (CSV export)
- PapaParse (CSV parsing)
- ZIP code geolocation API
- HTML and CSS

---

## Project Structure

```text
├── manifest.json        Chrome extension configuration
├── popup.html           User interface
├── popup.js             Main application logic
├── content.js           ZIP code detection from active tab
├── papaparse.min.js     Third-party CSV parsing library
