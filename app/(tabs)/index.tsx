// En el archivo: app/index.tsx

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Button, Platform, Alert } from 'react-native';
// CAMBIO 1: Importamos SafeAreaView desde la nueva librería
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

// --- El resto del código (constantes, funciones, etc.) permanece exactamente igual ---
const routePoints = [
    { id: 'P01', name: 'Alta Vista', lat: 8.293783, lon: -62.731365, type: 'stop' }, { id: 'P02', name: 'Jardín Levante', lat: 8.291485, lon: -62.730517, type: 'stop' }, { id: 'S01', lat: 8.288892, lon: -62.729533, type: 'shape' }, { id: 'S02', lat: 8.287608, lon: -62.728603, type: 'shape' }, { id: 'S03', lat: 8.286021, lon: -62.727349, type: 'shape' }, { id: 'S04', lat: 8.285419, lon: -62.725913, type: 'shape' }, { id: 'P03', name: 'La Churuata', lat: 8.285295, lon: -62.723157, type: 'stop' }, { id: 'S05', lat: 8.284229, lon: -62.722697, type: 'shape' }, { id: 'S06', lat: 8.283824, lon: -62.722845, type: 'shape' }, { id: 'S07', lat: 8.283292, lon: -62.723285, type: 'shape' }, { id: 'P04', name: 'UNEG Villa Asia', lat: 8.282621, lon: -62.723805, type: 'stop' }, { id: 'S08', lat: 8.281416, lon: -62.724750, type: 'shape' }, { id: 'S09', lat: 8.280634, lon: -62.725863, type: 'shape' }, { id: 'P05', name: 'UNEXPO', lat: 8.279560, lon: -62.727761, type: 'stop' }, { id: 'S10', lat: 8.278594, lon: -62.727118, type: 'shape' }, { id: 'S11', lat: 8.276450, lon: -62.730674, type: 'shape' }, { id: 'S12', lat: 8.273940, lon: -62.734797, type: 'shape' }, { id: 'S13', lat: 8.272908, lon: -62.736523, type: 'shape' }, { id: 'S14', lat: 8.271814, lon: -62.738584, type: 'shape' }, { id: 'P06', name: 'UNEG', lat: 8.271944, lon: -62.738006, type: 'stop' },
];
const stopsOnly = routePoints.filter(p => p.type === 'stop');
const SIMULATION_SPEED_KMH = 60;
const SIMULATION_INTERVAL_MS = 3000;
const EARTH_RADIUS_METERS = 6371000;

type Coords = { lat: number; lon: number; };
type StopInfo = { dist: number; stop: typeof stopsOnly[0] | null };

const toRad = (degrees: number) => degrees * Math.PI / 180;
const haversineDistance = (c1: Coords, c2: Coords): number => {
    if (!c1 || !c2) return 0;
    const dLat = toRad(c2.lat - c1.lat), dLon = toRad(c2.lon - c1.lon), lat1 = toRad(c1.lat), lat2 = toRad(c2.lat);
    const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return EARTH_RADIUS_METERS * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};
const generateMapHTML = () => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body, #map { margin: 0; padding: 0; height: 100vh; width: 100vw; }
        .bus-marker-icon { transition: transform 3s linear; font-size: 24px; }
        .user-marker-icon { font-size: 24px; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        const map = L.map('map').setView([8.285, -62.73], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        let busMarker;
        const busIcon = L.divIcon({ html: '🚌', className: 'bus-marker-icon', iconSize: [40, 40] });

        window.addEventListener("message", function(event) {
            // En React Native, los datos a veces vienen en event.nativeEvent.data
            const dataString = event.data || (event.nativeEvent && event.nativeEvent.data);
            if (typeof dataString !== 'string') return;
            
            const data = JSON.parse(dataString);
            
            if (data.type === 'INITIALIZE') {
                L.polyline(data.route, { color: '#007bff', weight: 5 }).addTo(map);
                data.stops.forEach(stop => {
                    L.marker([stop.lat, stop.lon], { icon: L.divIcon({ html: '🏢', iconSize: [30, 30] }) })
                     .addTo(map).bindPopup("<b>" + stop.name + "</b>");
                });
                busMarker = L.marker(data.bus, { icon: busIcon, zIndexOffset: 1000 }).addTo(map);
            }

            if (data.type === 'UPDATE_BUS') {
                if (busMarker) busMarker.setLatLng(data.coords);
            }
            
            if (data.type === 'UPDATE_USER') {
                if (!window.userMarker) {
                    window.userMarker = L.marker(data.coords, { icon: L.divIcon({ html: '🔵', className: 'user-marker-icon', iconSize: [24, 24] }) }).addTo(map);
                } else {
                    window.userMarker.setLatLng(data.coords);
                }
            }
        });
    </script>
</body>
</html>
`;


export default function Index() {
  const webviewRef = useRef<WebView>(null);
  const [userLocation, setUserLocation] = useState<Coords | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [nearestStop, setNearestStop] = useState<StopInfo | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const simState = useRef({
    intervalId: null as NodeJS.Timeout | null,
    currentSegmentIndex: 0,
    progressOnSegment: 0,
  });

  // ... (toda la lógica de useEffect, onMapLoad, etc. se mantiene igual)
  const onMapLoad = () => {
    const initialData = { type: 'INITIALIZE', route: routePoints.map(p => [p.lat, p.lon]), stops: stopsOnly, bus: { lat: routePoints[0].lat, lon: routePoints[0].lon }, };
    webviewRef.current?.postMessage(JSON.stringify(initialData));
    setMapReady(true);
  };
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permiso denegado', 'No se puede obtener la ubicación.'); return; }
      let location = await Location.getCurrentPositionAsync({});
      const userCoords = { lat: location.coords.latitude, lon: location.coords.longitude };
      setUserLocation(userCoords);
      findNearestStopToUser(userCoords);
    })();
  }, []);
  useEffect(() => {
    if (userLocation && mapReady) {
      const message = { type: 'UPDATE_USER', coords: [userLocation.lat, userLocation.lon] };
      webviewRef.current?.postMessage(JSON.stringify(message));
    }
  }, [userLocation, mapReady]);
  useEffect(() => {
    if (isSimulationRunning && mapReady) {
      simState.current.intervalId = setInterval(() => {
        const speedMps = SIMULATION_SPEED_KMH * 1000 / 3600;
        const distancePerTick = speedMps * (SIMULATION_INTERVAL_MS / 1000);
        let { currentSegmentIndex, progressOnSegment } = simState.current;
        let startPoint = routePoints[currentSegmentIndex];
        let endPoint = routePoints[currentSegmentIndex + 1];
        let segmentLength = haversineDistance(startPoint, endPoint);
        progressOnSegment += (segmentLength > 0) ? distancePerTick / segmentLength : 1;
        while (progressOnSegment >= 1.0 && currentSegmentIndex < routePoints.length - 2) { progressOnSegment -= 1.0; currentSegmentIndex++; }
        if (currentSegmentIndex >= routePoints.length - 2) { currentSegmentIndex = 0; progressOnSegment = 0; }
        simState.current = { ...simState.current, currentSegmentIndex, progressOnSegment };
        startPoint = routePoints[currentSegmentIndex];
        endPoint = routePoints[currentSegmentIndex + 1];
        const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * progressOnSegment;
        const lon = startPoint.lon + (endPoint.lon - startPoint.lon) * progressOnSegment;
        const message = { type: 'UPDATE_BUS', coords: [lat, lon] };
        webviewRef.current?.postMessage(JSON.stringify(message));
      }, SIMULATION_INTERVAL_MS);
    } else {
      if(simState.current.intervalId) clearInterval(simState.current.intervalId);
    }
    return () => { if(simState.current.intervalId) clearInterval(simState.current.intervalId); };
  }, [isSimulationRunning, mapReady]);
  const toggleSimulation = () => setIsSimulationRunning(prevState => !prevState);
  const findNearestStopToUser = (currentUserLocation: Coords) => {
    let closest: StopInfo = { dist: Infinity, stop: null };
    stopsOnly.forEach(stop => {
      const dist = haversineDistance(currentUserLocation, stop);
      if (dist < closest.dist) { closest = { dist, stop }; }
    });
    setNearestStop(closest);
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ html: generateMapHTML() }}
        onLoad={onMapLoad}
        javaScriptEnabled={true}
        style={{ flex: 1 }}
      />
      <View style={styles.controlsContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Parada más cercana a ti:</Text>
          {nearestStop?.stop ? (
            <Text style={styles.infoText}>{`${nearestStop.stop.name} (${(nearestStop.dist / 1000).toFixed(2)} km)`}</Text>
          ) : (
             <Text style={styles.infoText}>Calculando...</Text>
          )}
        </View>
        <Button
          title={isSimulationRunning ? "Detener Simulación" : "Iniciar Simulación"}
          onPress={toggleSimulation}
          color={isSimulationRunning ? "#dc3545" : "#28a745"}
          disabled={!mapReady}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // CAMBIO 2: Eliminamos el margen superior manual.
        // La nueva SafeAreaView lo gestiona automáticamente y mejor.
    },
    controlsContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    infoBox: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f0f2f5',
        borderRadius: 5,
    },
    infoTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#0056b3',
    },
    infoText: {
        fontSize: 14,
        marginTop: 4,
    }
});
