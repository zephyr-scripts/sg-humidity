Chart.register(ChartDataLabels);

const url = "https://api-open.data.gov.sg/v2/real-time/api/relative-humidity";

const customStationNames = {
    "Ang Mo Kio Avenue 5": "Ang Mo Kio",
    "Nanyang Avenue": "Joo Koon",
    "Pulau Ubin": "Pulau Ubin",
    "Banyan Road": "Jurong Island",
    "Kim Chuan Road": "Bartley / Tai Seng",
    "East Coast Parkway": "East Coast",
    "Woodlands Avenue 9": "Woodlands",
    "Tuas South Avenue 3": "Tuas South",
    "West Coast Highway": "West Coast",
    "Scotts Road": "Orchard",
    "Old Choa Chu Kang Road": "Choa Chu Kang",
    "Clementi Road": "Clementi",
    "Upper Changi Road North": "Upper Changi"
};

async function fetchAndDisplayChart() {
  const status = document.getElementById("status");
  const ctx = document.getElementById("humidityChart").getContext("2d");

  try {
    const response = await fetch(url);
    const result = await response.json();

    const readings = result.data?.readings[0]?.data || [];
    const stations = result.data?.stations || [];
    console.log('All available stations:', stations.map(station => station.name));

    // Map station ID to name
    const stationMap = {};
    stations.forEach((station) => {
      stationMap[station.id] = station.name;
    });

    // Combine readings with station info for sorting
    const stationInfoMap = {};
    stations.forEach(station => {
      stationInfoMap[station.id] = station;
    });
    // Create array of {reading, station} objects
    const readingsWithLocation = readings.map(reading => ({
      reading,
      station: stationInfoMap[reading.stationId]
    }));
    // Sort by longitude (west to east), then latitude (south to north)
    readingsWithLocation.sort((a, b) => {
      if (a.station.location.longitude !== b.station.location.longitude) {
        return a.station.location.longitude - b.station.location.longitude;
      }
      return a.station.location.latitude - b.station.location.latitude;
    });
    // Build labels and values from sorted array
    const labels = readingsWithLocation.map(({station}) => {
      const stationName = station.name;
      return customStationNames[stationName] || stationName;
    });
    const values = readingsWithLocation.map(({reading}) => reading.value);

    // Dynamically resize canvas width based on number of stations
    const widthPerBar = 100; // Increased for better spacing on mobile
    const chartWidth = labels.length * widthPerBar;
    const canvas = document.getElementById('humidityChart');
    canvas.width = chartWidth; // Set the drawing surface width
    canvas.style.width = `${chartWidth}px`; // Set the CSS width
    
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Humidity (%)",
            data: values,
            backgroundColor: "#a5b4fc", // pastel blue
            borderColor: "#6366f1", // soft indigo
            borderWidth: 1,
            borderRadius: 8,
            barPercentage: 0.7,
            categoryPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        layout: {
          padding: 20
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Humidity (%)",
              color: "#64748b",
              font: {
                family: "Outfit, sans-serif",
                size: 16,
                weight: "400"
              }
            },
            ticks: {
              color: "#64748b",
              font: {
                family: "Outfit, sans-serif",
                size: 14
              }
            },
            grid: {
              color: "#e0e7ef",
              borderColor: "#e0e7ef"
            }
          },
          x: {
            title: {
              display: true,
              text: "Stations",
              color: "#64748b",
              font: {
                family: "Outfit, sans-serif",
                size: 14,
                weight: "400"
              },
              padding: {
                top: 10,
              },
            },
            ticks: {
              maxRotation: 65,
              minRotation: 65,
              color: "#64748b",
              font: {
                family: "Outfit, sans-serif",
                size: 12
              }
            },
            grid: {
              color: "#f1f5f9",
              borderColor: "#f1f5f9"
            }
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              font: {
                family: "Outfit, sans-serif",
                size: 14,
                weight: "400",
              },
              color: "#64748b",
              padding: 20,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            backgroundColor: "#f1f5f9",
            titleColor: "#334155",
            bodyColor: "#334155",
            borderColor: "#a5b4fc",
            borderWidth: 1,
            titleFont: {
              family: "Outfit, sans-serif",
              weight: "400"
            },
            bodyFont: {
              family: "Outfit, sans-serif",
              weight: "400"
            },
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y}%`;
              },
            },
          },
          datalabels: {
            anchor: "center",
            align: "center",
            formatter: function (value) {
              return Math.floor(value) + "%";
            },
            color: "#334155",
            font: {
              family: "Outfit, sans-serif",
              weight: "400",
              size: 14
            },
          },
        },
      },
    });

    status.style.display = "none";
  } catch (error) {
    status.textContent = "Error loading data.";
    console.error("Chart error:", error);
  }
}

function startLiveClock() {
  const timestamp = document.getElementById("timestamp");

  function updateTime() {
    const now = new Date();

    // Convert to Singapore Time
    const sgTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Singapore" })
    );

    // Format the date
    const date = sgTime.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const time = sgTime.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    timestamp.textContent = `Data as of: ${date}, ${time} SGT`;
  }

  updateTime(); // initial call
  setInterval(updateTime, 1000); // update every second
}

// Initialize the map centered on Singapore
var map = L.map('map').setView([1.3521, 103.8198], 11);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch real-time humidity data and add markers
fetch('https://api-open.data.gov.sg/v2/real-time/api/relative-humidity')
  .then(response => response.json())
  .then(data => {
    const stations = data.data.stations;
    const readings = data.data.readings[0].data;
    // Map stationId to reading value
    const readingMap = {};
    readings.forEach(r => readingMap[r.stationId] = r.value);

    stations.forEach(station => {
      const value = readingMap[station.id];
      // Use customStationNames for display
      const displayName = customStationNames[station.name] || station.name;
      if (value !== undefined) {
        const marker = L.marker([station.location.latitude, station.location.longitude])
          .addTo(map)
          .bindTooltip(`<b>${displayName}</b>`, {permanent: true, direction: 'top', className: 'leaflet-tooltip-station'});
        marker.bindPopup(`Humidity: ${value}%`);
      }
    });
  });

fetchAndDisplayChart();
startLiveClock();
