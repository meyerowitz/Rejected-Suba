// BusEngine.js

// --- DATOS ESTÁTICOS ---
const EARTH_RADIUS_METERS = 6371000;
export const routePoints = [
    { id: 'P01', name: 'Alta Vista', lat: 8.293783, lon: -62.731365, type: 'stop' }, { id: 'P02', name: 'Jardín Levante', lat: 8.291485, lon: -62.730517, type: 'stop' }, { id: 'S01', lat: 8.288892, lon: -62.729533, type: 'shape' }, { id: 'S02', lat: 8.287608, lon: -62.728603, type: 'shape' }, { id: 'S03', lat: 8.286021, lon: -62.727349, type: 'shape' }, { id: 'S04', lat: 8.285419, lon: -62.725913, type: 'shape' }, { id: 'P03', name: 'La Churuata', lat: 8.285295, lon: -62.723157, type: 'stop' }, { id: 'S05', lat: 8.284229, lon: -62.722697, type: 'shape' }, { id: 'S06', lat: 8.283824, lon: -62.722845, type: 'shape' }, { id: 'S07', lat: 8.283292, lon: -62.723285, type: 'shape' }, { id: 'P04', name: 'UNEG Villa Asia', lat: 8.282621, lon: -62.723805, type: 'stop' }, { id: 'S08', lat: 8.281416, lon: -62.724750, type: 'shape' }, { id: 'S09', lat: 8.280634, lon: -62.725863, type: 'shape' }, { id: 'P05', name: 'UNEXPO', lat: 8.279560, lon: -62.727761, type: 'stop' }, { id: 'S10', lat: 8.278594, lon: -62.727118, type: 'shape' }, { id: 'S11', lat: 8.276450, lon: -62.730674, type: 'shape' }, { id: 'S12', lat: 8.273940, lon: -62.734797, type: 'shape' }, { id: 'S13', lat: 8.272908, lon: -62.736523, type: 'shape' }, { id: 'S14', lat: 8.271814, lon: -62.738584, type: 'shape' }, { id: 'P06', name: 'UNEG', lat: 8.271944, lon: -62.738006, type: 'stop' },
];
export const stopsOnly = routePoints.filter(p => p.type === 'stop');

const toRad = (degrees) => degrees * Math.PI / 180;
export const haversineDistance = (c1, c2) => {
    if (!c1 || !c2) return 0;
    const dLat = toRad(c2.lat - c1.lat), dLon = toRad(c2.lon - c1.lon);
    const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat));
    return EARTH_RADIUS_METERS * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

class BusSimulationEngine {
    constructor() {
        this.intervalId = null;
        this.subscribers = [];
        this.buses = []; // Array de buses activos
        this.simulationIntervalMs = 1000; // Actualización cada 1s para fluidez
    }

    getInitialData() {
        return { route: routePoints, stops: stopsOnly };
    }

    // --- MÉTODOS DE INYECCIÓN (API) ---
    addBus(config) {
        // config: { id, name, speedKmh, startStopId }
        const startIndex = routePoints.findIndex(p => p.id === config.startStopId);
        const safeIndex = startIndex >= 0 ? startIndex : 0;
        
        const newBus = {
            id: config.id,
            name: config.name,
            speedKmh: parseFloat(config.speedKmh),
            currentIndex: safeIndex,
            progress: 0,
            coords: { lat: routePoints[safeIndex].lat, lon: routePoints[safeIndex].lon },
            color: this.getRandomColor()
        };
        this.buses.push(newBus);
        console.log(`🚌 Bus agregado: ${newBus.name}`);
        this.tick(); // Actualizar inmediatamente
    }

    removeBus(busId) {
        this.buses = this.buses.filter(b => b.id !== busId);
        this.tick();
    }

    getRandomColor() {
        const colors = ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557', '#2a9d8f', '#e9c46a', '#f4a261'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // --- MOTOR ---
    subscribe(cb) { this.subscribers.push(cb); }
    unsubscribe(cb) { this.subscribers = this.subscribers.filter(s => s !== cb); }

    start() {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => this.tick(), this.simulationIntervalMs);
    }

    stop() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    tick() {
        // Mover cada autobús
        this.buses.forEach(bus => {
            const speedMps = bus.speedKmh * 1000 / 3600;
            const distanceMoved = speedMps * (this.simulationIntervalMs / 1000);
            
            let currentP = routePoints[bus.currentIndex];
            let nextP = routePoints[bus.currentIndex + 1];
            let segLen = haversineDistance(currentP, nextP);
            
            bus.progress += (segLen > 0) ? distanceMoved / segLen : 1;

            // Manejo de cambio de segmento
            while (bus.progress >= 1.0) {
                bus.progress -= 1.0;
                bus.currentIndex++;
                if (bus.currentIndex >= routePoints.length - 1) {
                    bus.currentIndex = 0; // Reiniciar loop
                }
                currentP = routePoints[bus.currentIndex];
                nextP = routePoints[bus.currentIndex + 1]; // Ojo: si es el último, siguiente es 0?
                
                // Corrección para el loop circular en el último punto
                if (!nextP) {
                     bus.currentIndex = 0;
                     currentP = routePoints[0];
                     nextP = routePoints[1];
                }
            }
            
            // Interpolar coords
            const lat = currentP.lat + (nextP.lat - currentP.lat) * bus.progress;
            const lon = currentP.lon + (nextP.lon - currentP.lon) * bus.progress;
            bus.coords = { lat, lon };
        });

        // Calcular ETAs para todos los buses
        const stopsEtas = this.calculateAllEtas();

        // Emitir estado
        const payload = {
            buses: this.buses.map(b => ({ 
                id: b.id, name: b.name, coords: b.coords, speed: b.speedKmh, color: b.color 
            })),
            stopsEtas: stopsEtas
        };
        this.subscribers.forEach(cb => cb(payload));
    }

    calculateAllEtas() {
        // Devuelve un objeto: { 'P01': [ {bus: 'B1', eta: 5}, {bus: 'B2', eta: 12} ] }
        const result = {};
        
        stopsOnly.forEach(stop => {
            const stopIndex = routePoints.findIndex(p => p.id === stop.id);
            const busEtas = [];

            this.buses.forEach(bus => {
                let dist = 0;
                // Distancia restante segmento actual
                const p1 = routePoints[bus.currentIndex];
                const p2 = routePoints[bus.currentIndex + 1] || routePoints[0];
                dist += haversineDistance(p1, p2) * (1 - bus.progress);

                // Distancia segmentos intermedios
                let i = bus.currentIndex + 1;
                // Proteccion loop infinito simple (max 1 vuelta)
                let pointsCount = 0; 
                while (i !== stopIndex && pointsCount < routePoints.length) {
                    if (i >= routePoints.length - 1) i = 0;
                    const sp1 = routePoints[i];
                    const sp2 = routePoints[i+1] || routePoints[0];
                    dist += haversineDistance(sp1, sp2);
                    i++;
                    pointsCount++;
                }

                const etaMin = (dist / (bus.speedKmh * 1000 / 3600)) / 60;
                // Si el bus ya "pasó" lógica simple: si eta > 60 min probablemente ya pasó y está dando la vuelta
                // Para este demo, mostramos todo.
                busEtas.push({ busName: bus.name, eta: etaMin, color: bus.color });
            });
            
            // Ordenar por llegada más próxima
            busEtas.sort((a, b) => a.eta - b.eta);
            result[stop.id] = busEtas;
        });
        return result;
    }
}

export const busEngine = new BusSimulationEngine();