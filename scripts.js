Chart.register(ChartDataLabels);

const url = "https://api-open.data.gov.sg/v2/real-time/api/relative-humidity";

const customStationNames = {
    "Ang Mo Kio Avenue 5": "Ang Mo Kio",
    "Pulau Ubin": "Pulau Ubin",
    "Banyan Road": "Jurong",
    "Kim Chuan Road": "Bartley / Tai Seng",
    "East Coast Parkway": "East Coast",
    "Woodlands Avenue 9": "Woodlands",
    "Tuas South Avenue 3": "Tuas",
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

    const labels = readings.map(reading => {
        const stationName = stationMap[reading.stationId];
        return customStationNames[stationName] || stationName;
    });
    const values = readings.map((reading) => reading.value);

    // Dynamically resize canvas width based on number of stations
    const widthPerBar = 80; // Adjust as needed for spacing
    const chartWidth = labels.length * widthPerBar;
    document.getElementById('humidityChart').style.width = `${chartWidth}px`;
    
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Humidity (%)",
            data: values,
            backgroundColor: "hsla(244, 64.80%, 58.80%, 0.60)",
            borderColor: "hsl(244, 81.90%, 56.70%)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Humidity (%)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Stations",
              font: {
                size: 14,
                weight: "bold",
              },
              padding: {
                top: 10,
              },
            },
            ticks: {
              maxRotation: 65,
              minRotation: 65,
              font: {
                size: 12,
              },
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "bottom",

            labels: {
              font: {
                size: 14,
                weight: "bold",
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
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
            color: "#000",
            font: {
              weight: "bold",
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

fetchAndDisplayChart();
startLiveClock();
