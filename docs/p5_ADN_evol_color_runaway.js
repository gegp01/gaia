let gridSize = 70;
let agents = [];
let temperatureGrid = [];
let mutationRate = 0.1;  // Tasa de mutación inicial
let lifespan = 10;
let diffusionRate = 0.3;
let generation = 0;
let initialTemperature = 25;
let isRunning = false;  // Inicializar como detenido

// Controles UI
let startStopButton;
let temperatureSlider;
let tempDisplay;
let mutationSlider;
let mutationDisplay;
let resetButton;  // Declaramos la variable globalmente

function setup() {
    createCanvas(700, 700);
    initGrid();
    initAgents(100);

    noLoop();  

    // Selección de botones
    startStopButton = select('#startStopButton');
    startStopButton.mousePressed(toggleSimulation);

    resetButton = select('#resetButton');  // Nuevo botón de reinicio
    resetButton.mousePressed(resetSimulation);

    temperatureSlider = select('#temperatureSlider');
    temperatureSlider.input(updateTemperature);
    tempDisplay = select('#tempValue');

        // Agregar control de mutación
    mutationSlider = select('#mutationSlider');
    mutationSlider.input(updateMutationRate);
    mutationDisplay = select('#mutationValue');
}


// Función para reiniciar la simulación
function resetSimulation() {
    isRunning = false;
    noLoop();  // Detener la simulación

    generation = 0;
    agents = [];  // Vaciar los agentes
    initGrid();   // Resetear la temperatura
    initAgents(100);  // Crear nuevos agentes

    select('#agentCount').html(agents.length);  // Actualizar contador de agentes
    startStopButton.html('Iniciar Simulación');  // Resetear el botón de inicio/parada

    redraw();  // Redibujar el lienzo
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

function randomGenome() {
    let length = floor(random(9, 9)); // Secuencias de tamaño fijo
    let bases = ['A', 'T', 'G', 'C'];
    return Array.from({ length }, () => random(bases)).join('');
}

class Agent {
    constructor(x, y, genome) {
        this.x = x;
        this.y = y;
        this.genome = genome;
        this.age = 0;
        this.color = genomeToColor(genome);
        
        // Temperatura óptima y tolerancia
        this.optimalTemp = map(brightness(this.color), 0, 100, 40, 5); // Run AWAY
//        this.optimalTemp = map(brightness(this.color), 0, 100, 5, 40);  
        this.tolerance = 5;  // Rango de tolerancia de temperatura
        
        this.reproductionCount = 0;  // Inicializar el contador de reproducciones
    }

    reproduce() {
        if (this.reproductionCount >= 5) return;  // Límite de 3 reproducciones por agente

        let newX = constrain(this.x + floor(random(-1, 2)), 0, gridSize - 1);
        let newY = constrain(this.y + floor(random(-1, 2)), 0, gridSize - 1);

        let temp = temperatureGrid[newX][newY];  // Temperatura de la celda

        // Reproducción solo si está en el rango óptimo de temperatura y la celda está vacía
        if (this.isCellEmpty(newX, newY) && temp >= (this.optimalTemp - this.tolerance) && temp <= (this.optimalTemp + this.tolerance)) {
            agents.push(new Agent(newX, newY, this.genome));
            this.reproductionCount++;  // Incrementar el contador de reproducciones
        }

    }

    update() {
        this.age++;
        this.modifyTemperature();
        if (this.age > lifespan) this.die();
    }

    modifyTemperature() {
        let brightnessValue = brightness(this.color); // Obtener el brillo del color

        // Mapear el brillo a un efecto térmico: negro calienta (+1), blanco enfría (-1)
        let effect = map(brightnessValue, 0, 100, 3, -3);

        // Aplicar el efecto térmico a la celda del agente
        temperatureGrid[this.x][this.y] += effect;
    }

    mutate() {
        let index = floor(random(this.genome.length));
        let bases = ['A', 'T', 'G', 'C'];
        this.genome = this.genome.substring(0, index) + random(bases) + this.genome.substring(index + 1);
        this.color = genomeToColor(this.genome);
    }

    die() {
        let index = agents.indexOf(this);
        if (index > -1) agents.splice(index, 1);
        // Aquí se marca la celda como vacía cuando el agente muere
        temperatureGrid[this.x][this.y] = initialTemperature;
    }

    // Verificar si la celda está vacía (sin agentes)
    isCellEmpty(x, y) {
        for (let agent of agents) {
            if (agent.x === x && agent.y === y) {
                return false; // La celda ya está ocupada
            }
        }
        return true; // La celda está vacía
    }
}

// Función que determina el color basado en la secuencia de nucleótidos
function genomeToColor(genome) {
    let aCount = (genome.match(/A/g) || []).length;
    let tCount = (genome.match(/T/g) || []).length;
    let gCount = (genome.match(/G/g) || []).length;
    let cCount = (genome.match(/C/g) || []).length;

    let r = map(aCount, 0, genome.length, 0, 255); // Base A = rojo
    let g = map(tCount, 0, genome.length, 0, 255); // Base T = verde
    let b = map(gCount, 0, genome.length, 0, 255); // Base G = azul
    let brightness = map(cCount, 0, genome.length, 0, 255); // Base C = brillo

    return color(r, g, b, brightness); // Color final del agente
}

function diffuseTemperature() {
    let newGrid = JSON.parse(JSON.stringify(temperatureGrid));
    for (let i = 1; i < gridSize - 1; i++) {
        for (let j = 1; j < gridSize - 1; j++) {
            let avgTemp = (
                temperatureGrid[i - 1][j] + temperatureGrid[i + 1][j] +
                temperatureGrid[i][j - 1] + temperatureGrid[i][j + 1]
            ) / 4;
            newGrid[i][j] += diffusionRate * (avgTemp - temperatureGrid[i][j]);
        }
    }
    temperatureGrid = newGrid;
}
/*
function draw() {
    if (!isRunning) return;  // Detener el dibujo si la simulación está detenida

    // Dibujo de la cuadrícula y los agentes
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

    generation++;
}
*/
function draw() {
    if (!isRunning) return;  

    drawGrid();
    agents.forEach(agent => agent.update());
    diffuseTemperature();
    agents.forEach(agent => agent.reproduce());

    let avgTemp = calculateGlobalTemperature();
    select('#calculatedTemp').html(`${avgTemp}`);  // Actualizar el HTML


    fill(0);
    textSize(16);
    textAlign(LEFT, BOTTOM);
    text(`Generación: ${generation}`, 10, height - 30);
    text(`Temperatura global (inicial): ${initialTemperature}°C`, 10, height - 50);
    text(`Temperatura global calculada: ${calculateGlobalTemperature()}°C`, 10, height - 70);
    text(`Agentes vivos: ${agents.length}`, 10, height - 90);  // Mostrar en pantalla

    // 🔹 Actualizar el contador en la interfaz
    select('#agentCount').html(agents.length);

    generation++;
}


function drawGrid() {
    background(0); // Establece el fondo en negro
    let w = width / gridSize;
    let h = height / gridSize;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            noStroke();
            fill(255);
            rect(i * w, j * h, w, h);
        }
    }
    agents.forEach(agent => {
        fill(agent.color);
        noStroke();
        ellipse(agent.x * w + w / 2, agent.y * h + h / 2, w, h);
    });
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

// Función para actualizar la tasa de mutación
function updateMutationRate() {
    mutationRate = float(mutationSlider.value());
    mutationDisplay.html(`${mutationRate}`);
}
