let gridSize = 100;
let agents = [];
let temperatureGrid = [];
let mutationRate = 0.01;
let lifespan = 10;
let diffusionRate = 0.1;
let generation = 0;
let initialTemperature = 25;
let isRunning = false;  // Inicializar como detenido

// Controles UI
let startStopButton;
let temperatureSlider;
let tempDisplay;

// Datos para la gráfica
let temperatureHistory = [];  // Aquí guardamos las temperaturas para la gráfica

// Gráfica
let chart;

function setup() {
    createCanvas(700, 700);
    initGrid();
    initAgents(100);

    // Detener la simulación al iniciar la página
    noLoop();  

    // Obtener los elementos de la UI
    startStopButton = select('#startStopButton');
    startStopButton.mousePressed(toggleSimulation);

    temperatureSlider = select('#temperatureSlider');
    temperatureSlider.input(updateTemperature);
    tempDisplay = select('#tempValue');

    // Crear la gráfica
    let ctx = document.getElementById('temperatureChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],  // Etiquetas para el tiempo
            datasets: [{
                label: 'Temperatura global (°C)',
                data: [],  // Datos de temperatura a lo largo del tiempo
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Generación'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    }
                }
            }
        }
    });
}

function initGrid() {
    for (let i = 0; i < gridSize; i++) {
        temperatureGrid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            temperatureGrid[i][j] = initialTemperature;
        }
    }
}

function initAgents(count) {
    for (let i = 0; i < count; i++) {
        let x = floor(random(gridSize));
        let y = floor(random(gridSize));
        let genome = randomGenome();
        agents.push(new Agent(x, y, genome));
    }
}

// Otros métodos no cambiaron, solo agregamos la gráfica

function draw() {
    if (!isRunning) return;  // Detener el dibujo si la simulación está detenida

    drawGrid();
    agents.forEach(agent => agent.update());
    diffuseTemperature();
    agents.forEach(agent => agent.reproduce());

    fill(0);
    textSize(16);
    textAlign(LEFT, BOTTOM);
    text(`Generación: ${generation}`, 10, height - 30);
    text(`Temperatura global (inicial): ${initialTemperature}°C`, 10, height - 50);
    text(`Temperatura global calculada: ${calculateGlobalTemperature()}°C`, 10, height - 70);

    // Añadir los datos a la gráfica
    updateGraph();

    generation++;
}

function updateGraph() {
    let currentTemp = calculateGlobalTemperature();
    temperatureHistory.push(currentTemp);
    
    // Limitar el número de puntos a mostrar en la gráfica
    if (temperatureHistory.length > 50) {
        temperatureHistory.shift();  // Eliminar el primer dato para mantener el tamaño
    }

    // Actualizar los labels y los datos de la gráfica
    chart.data.labels.push(generation);  // Agregar el número de generación
    chart.data.datasets[0].data = temperatureHistory;  // Actualizar los datos de temperatura

    // Actualizar la gráfica
    chart.update();
}

function calculateGlobalTemperature() {
    let totalTemp = 0;
    let count = 0;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            totalTemp += temperatureGrid[i][j];
            count++;
        }
    }
    let avgTemp = totalTemp / count;
    return round(avgTemp, 1);  // Redondear a 1 decimal
}

function toggleSimulation() {
    if (isRunning) {
        noLoop();  // Detener la simulación
        startStopButton.html('Iniciar Simulación');
    } else {
        loop();  // Iniciar la simulación
        startStopButton.html('Detener Simulación');
    }
    isRunning = !isRunning;
}

function updateTemperature() {
    initialTemperature = temperatureSlider.value();
    tempDisplay.html(`${initialTemperature}°C`);
    initGrid();
}
