// PRIMERA VERSION RE CHOTA

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Button, SafeAreaView, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

// --- DATOS Y CONSTANTES ---
const routePoints = [
    { id: 'P01', name: 'Alta Vista', lat: 8.293783, lon: -62.731365, type: 'stop' }, { id: 'P02', name: 'Jardín Levante', lat: 8.291485, lon: -62.730517, type: 'stop' }, { id: 'S01', lat: 8.288892, lon: -62.729533, type: 'shape' }, { id: 'S02', lat: 8.287608, lon: -62.728603, type: 'shape' }, { id: 'S03', lat: 8.286021, lon: -62.727349, type: 'shape' }, { id: 'S04', lat: 8.285419, lon: -62.725913, type: 'shape' }, { id: 'P03', name: 'La Churuata', lat: 8.285295, lon: -62.723157, type: 'stop' }, { id: 'S05', lat: 8.284229, lon: -62.722697, type: 'shape' }, { id: 'S06', lat: 8.283824, lon: -62.722845, type: 'shape' }, { id: 'S07', lat: 8.283292, lon: -62.723285, type: 'shape' }, { id: 'P04', name: 'UNEG Villa Asia', lat: 8.282621, lon: -62.723805, type: 'stop' }, { id: 'S08', lat: 8.281416, lon: -62.724750, type: 'shape' }, { id: 'S09', lat: 8.280634, lon: -62.725863, type: 'shape' }, { id: 'P05', name: 'UNEXPO', lat: 8.279560, lon: -62.727761, type: 'stop' }, { id: 'S10', lat: 8.278594, lon: -62.727118, type: 'shape' }, { id: 'S11', lat: 8.276450, lon: -62.730674, type: 'shape' }, { id: 'S12', lat: 8.273940, lon: -62.734797, type: 'shape' }, { id: 'S13', lat: 8.272908, lon: -62.736523, type: 'shape' }, { id: 'S14', lat: 8.271814, lon: -62.738584, type: 'shape' }, { id: 'P06', name: 'UNEG', lat: 8.271944, lon: -62.738006, type: 'stop' },
];
const stopsOnly = routePoints.filter(p => p.type === 'stop');
const SIMULATION_SPEED_KMH = 60;
const SIMULATION_INTERVAL_MS = 3000;
const EARTH_RADIUS_METERS = 6371000;

function decodePolyline(encoded) { let points=[],index=0,len=encoded.length,lat=0,lng=0;while(index<len){let b,shift=0,result=0;do{b=encoded.charCodeAt(index++)-63;result|=(b&0x1f)<<shift;shift+=5;}while(b>=0x20);let dlat=((result&1)?~(result>>1):(result>>1));lat+=dlat;shift=0;result=0;do{b=encoded.charCodeAt(index++)-63;result|=(b&0x1f)<<shift;shift+=5;}while(b>=0x20);let dlng=((result&1)?~(result>>1):(result>>1));lng+=dlng;points.push([lat/1e5,lng/1e5]);}return points;}
const toRad = (degrees) => degrees * Math.PI / 180;
const haversineDistance = (c1, c2) => { if (!c1 || !c2) return 0; const dLat = toRad(c2.lat - c1.lat), dLon = toRad(c2.lon - c1.lon), lat1 = toRad(c1.lat), lat2 = toRad(c2.lat); const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2); return EARTH_RADIUS_METERS * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); };

// --- CÓDIGO HTML PARA EL MAPA LEAFLET ---
const generateMapHTML = () => `
<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style> 
    body, #map { margin: 0; padding: 0; height: 100vh; width: 100vw; } 
    .bus-marker-icon { transition: transform 3s linear; font-size: 24px; } 
    .user-marker-icon { font-size: 24px; }
    .leaflet-popup-content-wrapper { border-radius: 5px; }
    .leaflet-popup-content { margin: 10px; font-size: 14px; }
    .popup-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
    .popup-eta { color: #0056b3; font-weight: bold; }
</style>
</head><body><div id="map"></div>
<script>
    const map = L.map('map').setView([8.285, -62.73], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    let busMarker, userRoutePolyline;
    const busIcon = L.divIcon({ html: '🚌', className: 'bus-marker-icon', iconSize: [40, 40] });
    const stopMarkers = {}; // Guardar referencias a los marcadores de parada

    document.addEventListener("message", function(event) {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'INITIALIZE':
                L.polyline(data.route, { color: '#007bff', weight: 5 }).addTo(map);
                data.stops.forEach(stop => {
                    const marker = L.marker([stop.lat, stop.lon], { icon: L.divIcon({ html: '🏢', iconSize: [30, 30] }) }).addTo(map);
                    marker.bindPopup(\`<div class="popup-title">\${stop.name}</div><div class="popup-eta">Calculando...</div>\`);
                    stopMarkers[stop.id] = marker;
                });
                busMarker = L.marker(data.bus, { icon: busIcon, zIndexOffset: 1000 }).addTo(map);
                busMarker.bindPopup(\`<b>Autobús</b>\`).openPopup();
                break;
            
            // [MODIFICADO] Un solo mensaje para actualizar todo el estado de la simulación
            case 'UPDATE_STATE':
                if (busMarker) {
                    busMarker.setLatLng(data.bus.coords);
                    busMarker.setPopupContent(\`<div class="popup-title">Autobús</div>Velocidad: <b>\${data.bus.speed.toFixed(1)} km/h</b>\`);
                }
                data.etas.forEach(etaInfo => {
                    const marker = stopMarkers[etaInfo.stopId];
                    if (marker) {
                        let etaText = 'Calculando...';
                        if (etaInfo.eta > 0.5) {
                            etaText = \`~\${etaInfo.eta.toFixed(0)} min\`;
                        } else if (etaInfo.eta > 0) {
                            etaText = 'Llegando';
                        } else if (etaInfo.eta === 0) {
                            etaText = 'Ya pasó';
                        }
                        marker.setPopupContent(\`<div class="popup-title">\${etaInfo.name}</div><div class="popup-eta">\${etaText}</div>\`);
                    }
                });
                break;

            case 'UPDATE_USER':
                if (!window.userMarker) {
                    window.userMarker = L.marker(data.coords, { icon: L.divIcon({ html: '🔵', className: 'user-marker-icon', iconSize: [24, 24] }) }).addTo(map);
                } else { window.userMarker.setLatLng(data.coords); }
                break;
            case 'DRAW_USER_ROUTE':
                if (userRoutePolyline) map.removeLayer(userRoutePolyline);
                userRoutePolyline = L.polyline(data.route, { color: '#17a2b8', weight: 4, dashArray: '5, 10' }).addTo(map);
                break;
        }
    });
</script></body></html>`;

export default function App() {
    const webviewRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    const [nearestStop, setNearestStop] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    
    const simState = useRef({ intervalId: null, currentSegmentIndex: 0, progressOnSegment: 0, previousBusState: null });

    const onMapLoad = () => {
        const initialData = { type: 'INITIALIZE', route: routePoints.map(p => [p.lat, p.lon]), stops: stopsOnly, bus: { lat: routePoints[0].lat, lon: routePoints[0].lon } };
        webviewRef.current.postMessage(JSON.stringify(initialData));
        setMapReady(true);
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') { Alert.alert('Permiso denegado'); return; }
            let location = await Location.getCurrentPositionAsync({});
            const userCoords = { lat: location.coords.latitude, lon: location.coords.longitude };
            setUserLocation(userCoords);
            findNearestStopToUser(userCoords);
        })();
    }, []);
    
    useEffect(() => {
        if (userLocation && nearestStop && mapReady) {
            webviewRef.current.postMessage(JSON.stringify({ type: 'UPDATE_USER', coords: [userLocation.lat, userLocation.lon] }));
            const fetchRoute = async () => {
                const from = `${userLocation.lon},${userLocation.lat}`; const to = `${nearestStop.stop.lon},${nearestStop.stop.lat}`;
                try {
                    const response = await fetch(`http://router.project-osrm.org/route/v1/driving/${from};${to}?overview=full&geometries=polyline`);
                    const json = await response.json();
                    if (json.routes && json.routes.length > 0) {
                        const decodedRoute = decodePolyline(json.routes[0].geometry);
                        webviewRef.current.postMessage(JSON.stringify({ type: 'DRAW_USER_ROUTE', route: decodedRoute }));
                    }
                } catch (error) { console.error("Error fetching OSRM route:", error); }
            };
            fetchRoute();
        }
    }, [userLocation, nearestStop, mapReady]);

    useEffect(() => {
        if (isSimulationRunning && mapReady) {
            simState.current.intervalId = setInterval(() => {
                const speedMps = SIMULATION_SPEED_KMH * 1000 / 3600;
                const distancePerTick = speedMps * (SIMULATION_INTERVAL_MS / 1000);
                let { currentSegmentIndex, progressOnSegment, previousBusState } = simState.current;
                
                let startPoint = routePoints[currentSegmentIndex];
                let endPoint = routePoints[currentSegmentIndex + 1];
                let segmentLength = haversineDistance(startPoint, endPoint);
                progressOnSegment += (segmentLength > 0) ? distancePerTick / segmentLength : 1;

                while (progressOnSegment >= 1.0 && currentSegmentIndex < routePoints.length - 2) {
                    progressOnSegment -= 1.0;
                    currentSegmentIndex++;
                }
                if (currentSegmentIndex >= routePoints.length - 2) { currentSegmentIndex = 0; progressOnSegment = 0; }
                
                startPoint = routePoints[currentSegmentIndex];
                endPoint = routePoints[currentSegmentIndex + 1];
                const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * progressOnSegment;
                const lon = startPoint.lon + (endPoint.lon - startPoint.lon) * progressOnSegment;
                const currentBusCoords = { lat, lon, timestamp: Date.now() };

                // Calcular ETAs y velocidad
                const etas = calculateAllEtas(currentBusCoords);
                let currentSpeedKmh = SIMULATION_SPEED_KMH;
                if(previousBusState) {
                    const dist = haversineDistance(previousBusState, currentBusCoords);
                    const timeSec = (currentBusCoords.timestamp - previousBusState.timestamp) / 1000;
                    currentSpeedKmh = timeSec > 0 ? (dist / timeSec) * 3.6 : 0;
                }

                // [MODIFICADO] Enviar un único mensaje con todo el estado
                webviewRef.current.postMessage(JSON.stringify({
                    type: 'UPDATE_STATE',
                    bus: {
                        coords: [lat, lon],
                        speed: currentSpeedKmh
                    },
                    etas: etas
                }));

                simState.current = { ...simState.current, currentSegmentIndex, progressOnSegment, previousBusState: currentBusCoords };
            }, SIMULATION_INTERVAL_MS);
        } else {
            clearInterval(simState.current.intervalId);
        }
        return () => clearInterval(simState.current.intervalId);
    }, [isSimulationRunning, mapReady]);

    const toggleSimulation = () => setIsSimulationRunning(prevState => !prevState);

    const findNearestStopToUser = (currentUserLocation) => {
        let closest = { dist: Infinity, stop: null };
        stopsOnly.forEach(stop => {
            const dist = haversineDistance(currentUserLocation, stop);
            if (dist < closest.dist) { closest = { dist, stop }; }
        });
        setNearestStop(closest);
    };

    const calculateAllEtas = (busCoords) => {
        const speedMps = SIMULATION_SPEED_KMH * 1000 / 3600;
        let bestMatch = { distance: Infinity, segment: null, t: 0 };
        for (const segment of segments) { const start = routePoints.find(p => p.id === segment.start), end = routePoints.find(p => p.id === segment.end); const { distance, t } = findNearestPointOnSegment(busCoords, start, end); if (distance < bestMatch.distance) { bestMatch = { distance, segment, t }; } }
        if (!bestMatch.segment) return [];

        return stopsOnly.map(stop => {
            const destinationIndex = routePoints.findIndex(p => p.id === stop.id);
            let remainingDistance = 0;
            const start = routePoints.find(p => p.id === bestMatch.segment.start);
            const end = routePoints.find(p => p.id === bestMatch.segment.end);
            remainingDistance += haversineDistance(start, end) * (1 - bestMatch.t);
            let startLoopIndex = routePoints.findIndex(p => p.id === end.id);
            
            if (startLoopIndex > destinationIndex) return { stopId: stop.id, name: stop.name, eta: 0 }; // Ya pasó
            if (startLoopIndex === destinationIndex) { return { stopId: stop.id, name: stop.name, eta: remainingDistance / speedMps / 60 }; }
            for (let i = startLoopIndex; i < destinationIndex; i++) { remainingDistance += haversineDistance(routePoints[i], routePoints[i+1]); }
            return { stopId: stop.id, name: stop.name, eta: remainingDistance / speedMps / 60 };
        });
    };
    const findNearestPointOnSegment = (bus, start, end) => { const p2 = projectToMeters(end, start), busP = projectToMeters(bus, start), len_sq = p2.x ** 2 + p2.y ** 2; if (len_sq === 0) return { distance: haversineDistance(bus, start), t: 0 }; const dot = busP.x * p2.x + busP.y * p2.y, t = Math.max(0, Math.min(1, dot / len_sq)), cP = { x: t * p2.x, y: t * p2.y }; return { distance: Math.sqrt((busP.x - cP.x) ** 2 + (busP.y - cP.y) ** 2), t }; }
    const projectToMeters = (target, origin) => { const dLat = target.lat - origin.lat, dLon = target.lon - origin.lon; return { x: dLon * (111320 * Math.cos(toRad(origin.lat))), y: dLat * 111132.954 }; }
    const segments = []; for (let i = 0; i < routePoints.length - 1; i++) { segments.push({ start: routePoints[i].id, end: routePoints[i+1].id }); }

    return (
        <SafeAreaView style={styles.container}>
            <WebView ref={webviewRef} source={{ html: generateMapHTML() }} onLoad={onMapLoad} javaScriptEnabled={true} style={{ flex: 1 }} />
            <View style={styles.controlsContainer}>
                <Button title={isSimulationRunning ? "Detener Simulación" : "Iniciar Simulación"} onPress={toggleSimulation} color={isSimulationRunning ? "#dc3545" : "#28a745"} disabled={!mapReady} />
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Parada más cercana a ti:</Text>
                    {nearestStop ? (
                        <Text style={styles.infoText}>{`${nearestStop.stop.name} (${(nearestStop.dist / 1000).toFixed(2)} km)`}</Text>
                    ) : ( <Text style={styles.infoText}>Calculando...</Text> )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, marginTop: Platform.OS === 'android' ? 25 : 0 },
    controlsContainer: { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd' },
    infoBox: { marginTop: 15, padding: 10, backgroundColor: '#f0f2f5', borderRadius: 5 },
    infoTitle: { fontWeight: 'bold', fontSize: 16, color: '#0056b3' },
    infoText: { fontSize: 14, marginTop: 4 }
});