// Variables para almacenar los gráficos y el mapa
let magnitudeTimeChart, earthquakeByCountryChart, depthHistogramChart, depthMagnitudeScatterChart;
let map; // Variable global para la instancia del mapa

// Inicializa los gráficos
function initializeCharts() {
    if (magnitudeTimeChart) magnitudeTimeChart.destroy();
    if (earthquakeByCountryChart) earthquakeByCountryChart.destroy();
    if (depthHistogramChart) depthHistogramChart.destroy(); // este será reemplazado
    if (depthMagnitudeScatterChart) depthMagnitudeScatterChart.destroy(); // este también será reemplazado

    // Gráfico de línea de magnitud en el tiempo
    magnitudeTimeChart = new Chart(document.getElementById('magnitudeTimeChart').getContext('2d'), {
        type: 'line',
        data: { 
            labels: [], 
            datasets: [{ label: 'Magnitud', data: [], borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }] 
        },
        options: { 
            responsive: true, 
            scales: { x: { beginAtZero: true, title: { display: true, text: 'Tiempo (ms)' } }, 
                      y: { beginAtZero: true, title: { display: true, text: 'Magnitud' } } } 
        }
    });

    // Gráfico de barras por país
    earthquakeByCountryChart = new Chart(document.getElementById('earthquakeByCountryChart').getContext('2d'), {
        type: 'bar',
        data: { 
            labels: [], 
            datasets: [{ label: 'Cantidad de Terremotos', data: [], backgroundColor: 'rgba(54, 162, 235, 0.6)' }] 
        },
        options: { 
            responsive: true, 
            scales: { x: { beginAtZero: true }, y: { beginAtZero: true } } 
        }
    });

    // Nuevo gráfico de análisis de tiempo en milisegundos (histograma de tiempos)
    timeAnalysisChart = new Chart(document.getElementById('timeAnalysisChart').getContext('2d'), {
        type: 'bar',
        data: { 
            labels: [], 
            datasets: [{
                label: 'Ocurrencias',
                data: [],
                backgroundColor: 'rgba(255, 159, 64, 0.6)'
            }]
        },
        options: { 
            responsive: true, 
            scales: { 
                x: { beginAtZero: true, title: { display: true, text: 'Intervalo de tiempo (ms)' } }, 
                y: { beginAtZero: true, title: { display: true, text: 'Ocurrencias' } }
            }
        }
    });

    // Gráfico de dispersión para magnitud vs tiempo en milisegundos
    magnitudeVsTimeScatterChart = new Chart(document.getElementById('magnitudeVsTimeScatterChart').getContext('2d'), {
        type: 'scatter',
        data: { 
            datasets: [{ label: 'Magnitud vs. Tiempo (ms)', data: [], backgroundColor: 'rgba(153, 102, 255, 0.6)' }] 
        },
        options: { 
            responsive: true, 
            scales: { 
                x: { beginAtZero: true, title: { display: true, text: 'Tiempo (ms)' } }, 
                y: { beginAtZero: true, title: { display: true, text: 'Magnitud' } } 
            } 
        }
    });

    fetchEarthquakeData("2020-01-01", "2023-01-01", "all", "", "");
}

function updateTimeAnalysisChart(data) {
    // Agrupa tiempos en intervalos (aquí puedes definir el tamaño del intervalo)
    const timeCounts = data.reduce((acc, item) => {
        const timeRange = Math.floor(item.time_ms / 1000000) * 1000000; // Intervalos de 1,000,000 ms
        acc[timeRange] = (acc[timeRange] || 0) + 1;
        return acc;
    }, {});

    timeAnalysisChart.data.labels = Object.keys(timeCounts).map(range => `${range}-${+range + 999999} ms`);
    timeAnalysisChart.data.datasets[0].data = Object.values(timeCounts);
    timeAnalysisChart.update();
}

function updateMagnitudeVsTimeScatterChart(data) {
    // Pasa los datos de tiempo y magnitud para el gráfico de dispersión
    magnitudeVsTimeScatterChart.data.datasets[0].data = data.map(item => ({ x: item.time_ms || 0, y: item.magnitude || 0 }));
    magnitudeVsTimeScatterChart.update();
}

document.getElementById("filter-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const startDate = document.getElementById("start-date").value || null;
    const endDate = document.getElementById("end-date").value || null;
    const country = document.getElementById("country").value || 'all';
    const minMagnitude = document.getElementById("min-magnitude").value || null;
    const maxMagnitude = document.getElementById("max-magnitude").value || null;

    fetchEarthquakeData(startDate, endDate, country, minMagnitude, maxMagnitude);
});

function fetchEarthquakeData(startDate, endDate, country, minMagnitude, maxMagnitude) {
    let url = `/api/terremotos?country=${country}`;
    
    // Agrega las fechas solo si ambas están presentes
    if (startDate && endDate) {
        url += `&fecha_inicio=${startDate}&fecha_fin=${endDate}`;
    }
    if (minMagnitude) {
        url += `&min-magnitude=${minMagnitude}`;
    }
    if (maxMagnitude) {
        url += `&max-magnitude=${maxMagnitude}`;
    }

    fetch(url)
    .then(response => response.json())
    .then(data => {
        updateMagnitudeTimeChart(data);
        updateEarthquakeByCountryChart(data);
        updateTimeAnalysisChart(data); // Actualiza el histograma de tiempo
        updateMagnitudeVsTimeScatterChart(data); // Actualiza el gráfico de magnitud vs tiempo
        updateMap(data);
        displayResults(data);
    })
    .catch(error => console.error("Error:", error));
}

function fetchMagnitudeStats() {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const country = document.getElementById("country").value;
    const minMagnitude = document.getElementById("min-magnitude").value;
    const maxMagnitude = document.getElementById("max-magnitude").value;

    const url = `/api/estadisticas/magnitud?fecha_inicio=${startDate}&fecha_fin=${endDate}&country=${country}&min-magnitude=${minMagnitude}&max-magnitude=${maxMagnitude}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Asigna valores predeterminados si los datos son null
            const promedio = data.magnitud_promedio !== null ? data.magnitud_promedio.toFixed(2) : 'N/A';
            const maxima = data.magnitud_maxima !== null ? data.magnitud_maxima : 'N/A';
            const minima = data.magnitud_minima !== null ? data.magnitud_minima : 'N/A';

            const output = `
                <p>Magnitud Promedio: ${promedio}</p>
                <p>Magnitud Máxima: ${maxima}</p>
                <p>Magnitud Mínima: ${minima}</p>
            `;
            document.getElementById("statistics-data").innerHTML = output;
        })
        .catch(error => console.error("Error:", error));
}


function displayResults(data) {
    let output = "<ul>";
    data.forEach(item => {
        output += `<li>${item.date} - Magnitud: ${item.magnitude} - Lugar: ${item.place}</li>`;
    });
    output += "</ul>";
    document.getElementById("earthquake-data").innerHTML = output;
}

function updateMagnitudeTimeChart(data) {
    magnitudeTimeChart.data.labels = data.map(item => item.date);
    magnitudeTimeChart.data.datasets[0].data = data.map(item => isNaN(item.magnitude) ? 0 : item.magnitude);
    magnitudeTimeChart.update();
}

function updateEarthquakeByCountryChart(data) {
    const countryCounts = data.reduce((acc, item) => {
        acc[item.place] = (acc[item.place] || 0) + 1;
        return acc;
    }, {});
    earthquakeByCountryChart.data.labels = Object.keys(countryCounts);
    earthquakeByCountryChart.data.datasets[0].data = Object.values(countryCounts);
    earthquakeByCountryChart.update();
}

function updateDepthHistogramChart(data) {
    if (data.length === 0) return; // Si no hay datos, mantener valores predeterminados

    const depthCounts = data.reduce((acc, item) => {
        const depthRange = Math.floor(item.depth / 10) * 10;
        acc[depthRange] = (acc[depthRange] || 0) + 1;
        return acc;
    }, {});

    depthHistogramChart.data.labels = Object.keys(depthCounts).map(range => `${range}-${+range + 9}`);
    depthHistogramChart.data.datasets[0].data = Object.values(depthCounts);
    depthHistogramChart.update();
}

function updateDepthMagnitudeScatterChart(data) {
    depthMagnitudeScatterChart.data.datasets[0].data = data.map(item => ({ x: item.depth || 0, y: item.magnitude || 0 }));
    depthMagnitudeScatterChart.update();
}

function updateMap(data) {
    // Inicializa el mapa solo si no ha sido creado previamente
    if (!map) {
        map = L.map('earthquakeMap').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }

    // Elimina cualquier marcador previo para evitar duplicaciones
    map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    // Agrega nuevos marcadores solo si los valores son válidos
    data.forEach(item => {
        const lat = item.latitude;
        const lon = item.longitude;
        const mag = item.magnitude;

        // Verifica que latitude, longitude y magnitude sean números válidos
        if (
            lat !== undefined && !isNaN(lat) &&
            lon !== undefined && !isNaN(lon) &&
            mag !== undefined && !isNaN(mag)
        ) {
            const radius = Math.log(mag + 1) * 2; // Aplica log solo si mag es válido
            L.circleMarker([lat, lon], {
                color: 'red',
                radius: radius || 2  // Usa un radio por defecto si el cálculo falla
            }).addTo(map).bindPopup(`Magnitud: ${mag}<br>Lugar: ${item.place}`);
        } else {
            console.warn("Datos incompletos o inválidos para el marcador:", item);
        }
    });
}


function loadStateOptions() {
    fetch('/api/estados')
        .then(response => response.json())
        .then(states => {
            const countrySelect = document.getElementById("country");
            countrySelect.innerHTML = '<option value="all">Todos</option>';
            states.forEach(state => {
                const option = document.createElement("option");
                option.value = state;
                option.textContent = state;
                countrySelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error al cargar las opciones de estado:", error));
}

document.addEventListener("DOMContentLoaded", function() {
    initializeCharts();
    loadStateOptions();
});
