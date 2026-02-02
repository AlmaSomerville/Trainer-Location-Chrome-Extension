# Trainer-Location-Chrome-Extension

Location-based trainer finder that calculates real distances, checks live availability from Google Sheets, and returns the nearest open options with one-click Google Maps directions.

# Trainer Locator & Availability Finder

This project is a small location-based web app / Chrome extension that helps sales teams quickly find the nearest available trainer based on a customer’s ZIP code.

I built it to solve a real internal workflow problem and to practice working with real-world data, browser APIs, and geographic calculations.

---

## What the App Does

- Accepts a 5-digit US ZIP code (either entered manually or auto-detected from the current page, in this case HubSpot)
- Converts the ZIP code into latitude and longitude
- Calculates distances to hard-coded trainers using geographic coordinates
- Loads trainer availability dynamically from a CSV published via Google Sheets
- Finds the next available date for each trainer
- Displays the nearest trainers along with distance and one-click Google Maps directions

---

## Why I Built This

This tool was originally built for a sales team where most operational data lived in Google Sheets.

Before this app, the workflow looked like this:

1. Open a spreadsheet to find trainer locations  
2. Copy a trainer address into Google Maps  
3. Copy the customer location from HubSpot  
4. Paste that into Google Maps to estimate distance  
5. Open a second spreadsheet to check trainer availability  

This process was slow, repetitive, and error-prone.

The goal of this project was to reduce that entire workflow to a single lookup:

- One ZIP code  
- One list of nearby trainers  
- Immediate visibility of availability  
- One-click directions to the trainer when needed  

---

## Design Decisions

### Hard-coded Trainer Locations
Trainer location data is hard-coded in the app rather than loaded from Google Sheets.  

This was a deliberate choice: loading the trainer “phone book” from Google Sheets caused a noticeable delay (1–3 seconds) in the Chromium extension popup. Hard-coding this data made the UI feel instant and more reliable, while dynamic availability still loads in real time.

### Distance Calculation
Distances are calculated using the Haversine formula, a standard method for computing distances between geographic coordinates.  
The implementation is based on widely available examples and adapted for this project.

### CSV Parsing
PapaParse is used for CSV parsing. The library is included directly and used as-is rather than being reimplemented.

---

## How It Works

1. When the extension is clicked, the popup reads the ZIP code from HubSpot automatically (or the user can enter it manually)  
2. The ZIP code is resolved to a geographic location (with basic caching to reduce repeated requests)  
3. Distances to all trainers are calculated using the Haversine formula  
4. Availability data is fetched and parsed from a CSV file  
5. Each trainer is matched to their next available slot  
6. Results are sorted by distance and displayed along with one-click Google Maps directions  

---

## Tech Used

- JavaScript (ES6+)  
- Chrome Extension APIs  
- Google Sheets (CSV export)  
- PapaParse (CSV parsing)  
- ZIP code geolocation API  
- HTML and CSS  

---

## skills

JavaScript fundamentals & ES6+ syntax – DOM manipulation, array methods, event handling

Chrome Extension development – content scripts, popups, messaging between scripts

Working with APIs & external data – CSV parsing, ZIP code geolocation, Google Sheets integration

Problem solving & workflow automation – transforming a multi-step manual process into a one-click lookup

UI & UX considerations – instant feedback, minimal delay, clear presentation of data

Geospatial calculations – Haversine formula for real-world distance measurement

---

## Project Structure

```text
├── manifest.json        Chrome extension configuration
├── popup.html           User interface
├── popup.js             Main application logic
├── content.js           ZIP code detection from the active tab
├── papaparse.min.js     Third-party CSV parsing library
