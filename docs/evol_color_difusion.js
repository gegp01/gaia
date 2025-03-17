class Agente {
    constructor(genomaInicial) {
        this.genoma = genomaInicial || this.generarGenomaAleatorio();
        this.color = this.decodificarGenomaAColor(this.genoma);
        this.temperaturaOptima = this.calcularTemperaturaOptima(this.color);
        this.intensidadColor = this.colorIntensity();
    }

    generarGenomaAleatorio() {
        const aminoacidos = '0123456789ABCDEF';
        let genoma = '';
        for (let i = 0; i < 6; i++) {
            genoma += aminoacidos[Math.floor(Math.random() * aminoacidos.length)];
        }
        return genoma;
    }

    decodificarGenomaAColor(genoma) {
        const rHex = genoma.substring(0, 2);
        const gHex = genoma.substring(2, 4);
        const bHex = genoma.substring(4, 6);
        const r = parseInt(rHex, 16);
        const g = parseInt(gHex, 16);
        const b = parseInt(bHex, 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    calcularTemperaturaOptima(color) {
        const rgbValues = color.substring(4, color.length - 1).split(',').map(Number);
        const intensity = (rgbValues[0] + rgbValues[1] + rgbValues[2]) / (255 * 3);
        return 20 + (intensity * 30);
    }

    colorIntensity() {
        const rgbValues = this.color.substring(4, this.color.length - 1).split(',').map(Number);
        return (rgbValues[0] + rgbValues[1] + rgbValues[2]) / (255 * 3);
    }
}

class Celda {
    constructor() {
        this.agente = null;
        this.temperatura = 0;
    }
}

class Habitat {
    constructor(size, mutationRate = 0.05, deathRate = 0.3, globalTemperature = 25, heatDiffusionRate = 0.1) {
        this.size = size;
        this.grid = Array(size).fill(null).map(() => Array(size).fill(null).map(() => new Celda()));
        this.mutationRate = mutationRate;
        this.deathRate = deathRate;
        this.globalTemperature = globalTemperature;
        this.heatDiffusionRate = heatDiffusionRate;
    }

    inicializar(numAgentesIniciales) {
        for (let i = 0; i < numAgentesIniciales; i++) {
            const row = Math.floor(Math.random() * this.size);
            const col = Math.floor(Math.random() * this.size);
            if (!this.grid[row][col].agente) {
                this.grid[row][col].agente = new Agente();
            }
        }
    }

    render() {
        let habitatOutput = "";

        for (let i = 0; i < this.size; i++) {
            habitatOutput += "<div>"; // Start of a row div
            for (let j = 0; j < this.size; j++) {
                const celda = this.grid[i][j];
                let backgroundColor = '#eee';
                if (celda.agente) {
                    backgroundColor = celda.agente.color;
                }
                const temperaturaNormalizada = (celda.temperatura - (this.globalTemperature - 5)) / 10; // Rango aproximado de temperatura
                const intensidadCalor = Math.max(0, Math.min(1, temperaturaNormalizada));
                const colorCalor = `rgba(255, 0, 0, ${intensidadCalor * 0.3})`; // Rojo para calor

                const intensidadFrio = Math.max(0, Math.min(1, -(temperaturaNormalizada)));
                const colorFrio = `rgba(0, 0, 255, ${intensidadFrio * 0.3})`; // Azul para frío

                const overlayColor = celda.temperatura > this.globalTemperature ? colorCalor : (celda.temperatura < this.globalTemperature ? colorFrio : 'transparent');

                habitatOutput += `<span class="celda" style="background-color: ${backgroundColor}; position: relative; overflow: hidden;">`;
                if (overlayColor !== 'transparent') {
                    habitatOutput += `<span style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: ${overlayColor};"></span>`;
                }
                habitatOutput += `</span>`;
            }
            habitatOutput += "<br>";
        }

        document.getElementById('habitat').innerHTML = habitatOutput;
        document.getElementById('globalTemperatureValue').textContent = `${this.globalTemperature.toFixed(1)} °C`;
    }

    contarAgentesPorColor() {
        const counts = {};
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j].agente) {
                    const color = this.grid[i][j].agente.color;
                    counts[color] = (counts[color] || 0) + 1;
                }
            }
        }
        return counts;
    }

    guardarDatos() {
        const datos = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j].agente) {
                    datos.push({
                        x: j,
                        y: i,
                        genoma: this.grid[i][j].agente.genoma,
                        color: this.grid[i][j].agente.color,
                        temperaturaOptima: this.grid[i][j].agente.temperaturaOptima.toFixed(2),
                        temperaturaCelda: this.grid[i][j].temperatura.toFixed(2)
                    });
                }
            }
        }
        return datos;
    }

    calcularTemperatura(row, col) {
        const celda = this.grid[row][col];
        celda.temperatura = this.globalTemperature;
        if (celda.agente) {
            const absorcion = 1 - celda.agente.intensidadColor;
            celda.temperatura += (absorcion * 15);
        }
    }

    diffundirCalor() {
        const nuevaGridTemperaturas = Array(this.size).fill(null).map(() => Array(this.size).fill(0));

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                nuevaGridTemperaturas[i][j] = this.grid[i][j].temperatura;
                const agente = this.grid[i][j].agente;

                if (agente) {
                    const efectoCalor = (0.5 - agente.intensidadColor) * 2; // Ajusté el factor para un efecto más sutil

                    const vecinos = this.obtenerVecinos(i, j);
                    let numVecinos = vecinos.length + 1; // Incluir la propia celda

                    nuevaGridTemperaturas[i][j] += efectoCalor * this.heatDiffusionRate; // Afecta su propia celda

                    for (const vecino of vecinos) {
                        nuevaGridTemperaturas[vecino.r][vecino.c] += efectoCalor * this.heatDiffusionRate;
                    }
                }
            }
        }

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j].temperatura = nuevaGridTemperaturas[i][j];
            }
        }
    }

    obtenerVecinos(row, col) {
        const vecinos = [];
        const direcciones = [
            { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
        ];

        for (const dir of direcciones) {
            const nr = row + dir.r;
            const nc = col + dir.c;
            if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                vecinos.push({ r: nr, c: nc });
            }
        }
        return vecinos;
    }

    setGlobalTemperature(newTemperature) {
        this.globalTemperature = parseFloat(newTemperature);
        document.getElementById('globalTemperatureValue').textContent = `${this.globalTemperature.toFixed(1)} °C`;
    }

    reproducir(row, col) {
        const agente = this.grid[row][col].agente;
        if (!agente) return;

        const temperaturaCelda = this.grid[row][col].temperatura;
        const tolerancia = 2;

        if (temperaturaCelda >= agente.temperaturaOptima - tolerancia && temperaturaCelda <= agente.temperaturaOptima + tolerancia) {
            const vecinos = this.obtenerVecinosVacios(row, col);
            if (vecinos.length > 0) {
                const vecinoAleatorio = vecinos[Math.floor(Math.random() * vecinos.length)];
                const nuevoGenoma = this.mutarGenoma(agente.genoma);
                this.grid[vecinoAleatorio.r][vecinoAleatorio.c].agente = new Agente(nuevoGenoma);
            }
        }
    }

    mutarGenoma(genoma) {
        let nuevoGenoma = '';
        const aminoacidos = '0123456789ABCDEF';
        for (let i = 0; i < genoma.length; i++) {
            if (Math.random() < this.mutationRate) {
                nuevoGenoma += aminoacidos[Math.floor(Math.random() * aminoacidos.length)];
            } else {
                nuevoGenoma += genoma[i];
            }
        }
        return nuevoGenoma;
    }

    obtenerVecinosVacios(row, col) {
        const vecinos = [];
        const direcciones = [
            { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
        ];

        for (const dir of direcciones) {
            const nr = row + dir.r;
            const nc = col + dir.c;
            if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && !this.grid[nr][nc].agente) {
                vecinos.push({ r: nr, c: nc });
            }
        }
        return vecinos;
    }

    actualizar() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.calcularTemperatura(i, j);
            }
        }

        this.diffundirCalor();

        const agentesParaReproducir = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j].agente) {
                    const temperaturaCelda = this.grid[i][j].temperatura;
                    const temperaturaOptima = this.grid[i][j].agente.temperaturaOptima;
                    const tolerancia = 2;

                    if (temperaturaCelda >= temperaturaOptima - tolerancia && temperaturaCelda <= temperaturaOptima + tolerancia) {
                        agentesParaReproducir.push({ r: i, c: j });
                    }
                }
            }
        }
        for (const agentePos of this.shuffleArray(agentesParaReproducir)) {
            this.reproducir(agentePos.r, agentePos.c);
        }

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j].agente) {
                    const temperaturaCelda = this.grid[i][j].temperatura;
                    const temperaturaOptima = this.grid[i][j].agente.temperaturaOptima;
                    const tolerancia = 2;

                    if (!(temperaturaCelda >= temperaturaOptima - tolerancia && temperaturaCelda <= temperaturaOptima + tolerancia)) {
                        if (Math.random() < this.deathRate) {
                            this.grid[i][j].agente = null;
                        }
                    }
                }
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// --- Simulación ---
const habitatSize = 100;
const numAgentesIniciales = 100;
const mutationRate = 0.1;
const deathRate = 0.3;
const initialGlobalTemperature = 25;
const initialHeatDiffusionRate = 0.1;
const habitat = new Habitat(habitatSize, mutationRate, deathRate, initialGlobalTemperature, initialHeatDiffusionRate);
habitat.inicializar(numAgentesIniciales);

let tiempo = 0;
let simulacionTimeoutId;

function ejecutarSimulacion() {
    habitat.actualizar();
    habitat.render();
    document.getElementById('tiempo').textContent = `Tiempo: ${tiempo}`;
    const datosGeneracion = habitat.guardarDatos();
    console.log(`Tiempo ${tiempo}: Datos de la población`, datosGeneracion.length);
    tiempo++;
    simulacionTimeoutId = setTimeout(ejecutarSimulacion, 200);
}

function iniciarSimulacion() {
    if (!simulacionTimeoutId) {
        ejecutarSimulacion();
        console.log("Simulación iniciada.");
    } else {
        console.log("La simulación ya está en ejecución.");
    }
}

function detenerSimulacion() {
    if (simulacionTimeoutId) {
        clearTimeout(simulacionTimeoutId);
        console.log("Simulación detenida.");
        simulacionTimeoutId = null;
    } else {
        console.log("La simulación no estaba en ejecución.");
    }
}

function cambiarTemperaturaGlobal(nuevaTemperatura) {
    habitat.setGlobalTemperature(nuevaTemperatura);
}

function cambiarTasaDifusion(nuevaTasa) {
    habitat.heatDiffusionRate = parseFloat(nuevaTasa);
    console.log(`Tasa de difusión de calor establecida en: ${habitat.heatDiffusionRate}`);
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    const iniciarBtn = document.getElementById('iniciarSimBtn');
    const detenerBtn = document.getElementById('detenerSimBtn');
    const aplicarTempBtn = document.getElementById('aplicarTemperaturaBtn');
    const aplicarDifusionBtn = document.getElementById('aplicarDifusionBtn');
    const tempInput = document.getElementById('globalTemperatureInput');
    const diffusionInput = document.getElementById('heatDiffusionRateInput');

    if (iniciarBtn) iniciarBtn.addEventListener('click', iniciarSimulacion);
    if (detenerBtn) detenerBtn.addEventListener('click', detenerSimulacion);
    if (aplicarTempBtn) aplicarTempBtn.addEventListener('click', () => cambiarTemperaturaGlobal(tempInput.value));
    if (aplicarDifusionBtn) aplicarDifusionBtn.addEventListener('click', () => cambiarTasaDifusion(diffusionInput.value));

    // Optionally start the simulation on load
    // iniciarSimulacion();
});