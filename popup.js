const trainers = [
  { name: "Trainer Alpha", zip: "10001", lat: 40.7506, lon: -73.9972, city: "Sample City", state: "NY" },
  { name: "Trainer Bravo", zip: "11201", lat: 40.6943, lon: -73.9928, city: "Sample City", state: "NY" },
  { name: "Trainer Charlie", zip: "07030", lat: 40.7440, lon: -74.0324, city: "Sample City", state: "NJ" },
  { name: "Trainer Delta", zip: "19103", lat: 39.9526, lon: -75.1652, city: "Sample City", state: "PA" },
  { name: "Trainer Echo", zip: "21201", lat: 39.2904, lon: -76.6122, city: "Sample City", state: "MD" }
];

let trainerSlots = [];
let detectedZip = null;
const cache = {};

// Cache known ZIP locations
trainers.forEach(t => {
  cache[t.zip] = {
    lat: t.lat,
    lon: t.lon,
    city: t.city,
    state: t.state
  };
});

async function fetchTrainerCSV() {
  // NOTE: Real production URL intentionally omitted from public repo
  const sheetUrl = 'YOUR_GOOGLE_SHEET_CSV_URL';

  try {
    const res = await fetch(sheetUrl);
    const text = await res.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    trainerSlots = parsed.data;
    if (detectedZip) search(detectedZip);
  } catch (err) {
    console.error('CSV Error:', err);
  }
}

async function getLoc(zip) {
  if (cache[zip]) return cache[zip];

  try {
    const r = await fetch(`https://api.zippopotam.us/us/${zip}`);
    const d = await r.json();

    if (d.places?.[0]) {
      const loc = {
        lat: parseFloat(d.places[0].latitude),
        lon: parseFloat(d.places[0].longitude),
        city: d.places[0]['place name'],
        state: d.places[0]['state abbreviation']
      };
      cache[zip] = loc;
      return loc;
    }
  } catch (e) {
    console.error("ZIP API Error");
  }

  return null;
}

function getNextSlot(trainerName) {
  if (!trainerSlots.length) return "Full";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const headers = Object.keys(trainerSlots[0]);
  const nameHeader = headers[0];

  const searchName = trainerName.toLowerCase().split(' ')[1] || trainerName.toLowerCase();

  const startIndex = trainerSlots.findIndex(r =>
    String(r[nameHeader] || "").toLowerCase().includes(searchName)
  );

  if (startIndex === -1) return "Full";

  let endIndex = trainerSlots.findIndex(
    (r, idx) => idx > startIndex && String(r[nameHeader] || "").includes(",")
  );
  if (endIndex === -1) endIndex = trainerSlots.length;

  const trainerRows = trainerSlots.slice(startIndex, endIndex);
  const dateHeaders = headers.filter(h => /^\d{2}\/\d{2}\/\d{4}$/.test(h.trim()));

  dateHeaders.sort((a, b) => {
    const [da, ma, ya] = a.split('/').map(Number);
    const [db, mb, yb] = b.split('/').map(Number);
    return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
  });

  for (let dateStr of dateHeaders) {
    const [d, m, y] = dateStr.split('/').map(Number);
    const slotDate = new Date(y, m - 1, d);

    if (slotDate >= today) {
      for (let row of trainerRows) {
        let cellValue = String(row[dateStr] || "").trim().toUpperCase();

        if (cellValue.includes("OPEN") || /^\d+$/.test(cellValue)) {
          let dateDisplay = slotDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });

          let match = cellValue.match(/\d+/);
          if (match) return `${dateDisplay} (${match[0]} weeks)`;

          return dateDisplay;
        }
      }
    }
  }

  for (let dateStr of dateHeaders) {
    const [d, m, y] = dateStr.split('/').map(Number);
    const slotDate = new Date(y, m - 1, d);
    if (slotDate >= today) {
      return slotDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + "*";
    }
  }

  return "Full";
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function search(zip) {
  detectedZip = zip;
  const el = document.getElementById('results');

  if (!/^\d{5}$/.test(zip)) return;

  el.innerHTML = '<p>Searching...</p>';

  const user = await getLoc(zip);
  if (!user) {
    el.innerHTML = '<p>ZIP not found</p>';
    return;
  }

  const distances = trainers.map(t => {
    const d = haversine(user.lat, user.lon, t.lat, t.lon);
    return {
      ...t,
      distance: Math.round(d),
      availability: getNextSlot(t.name)
    };
  });

  distances.sort((a, b) => a.distance - b.distance);

  el.innerHTML =
    `<p>${zip} (${user.city}, ${user.state})</p>` +
    distances.slice(0, 5).map(t => {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        `${user.city}, ${user.state} ${zip}, USA`
      )}&destination=${encodeURIComponent(
        `${t.city}, ${t.state} ${t.zip}, USA`
      )}`;

      const color =
        t.availability !== "Full" ? '#2ecc71' : '#95a5a6';

      return `
        <a href="${url}" target="_blank" class="trainer-card">
          <div class="trainer-info">
            <span class="trainer-name">${t.name}</span>
            <span>${t.city}, ${t.state}</span>
            <span style="font-size: 0.85em; font-weight: bold; color: ${color};">
              ${t.availability}
            </span>
          </div>
          <span class="distance">${t.distance} mi</span>
        </a>
      `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  fetchTrainerCSV();

  document.getElementById('zip').addEventListener('input', e => {
    if (e.target.value.length === 5) search(e.target.value);
  });

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: 'GET_ZIP' },
        response => {
          if (response?.zip) {
            document.getElementById('zip').value = response.zip;
            search(response.zip);
          }
        }
      );
    }
  });
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'ZIP_FOUND' && msg.zip) {
    document.getElementById('zip').value = msg.zip;
    search(msg.zip);
  }
});
