// App.js
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Importaciones locales
import { busEngine, haversineDistance } from './BusEngine';
import AdminPanel from './AdminPanel';

// HTML Soporte Multi-Bus y Popups compuestos 
const generateMapHTML = () => `
<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style> 
    body, #map { margin: 0; padding: 0; height: 100vh; width: 100vw; } 
    .user-marker-icon { font-size: 24px; }
    .popup-title { font-weight: bold; font-size: 16px; border-bottom: 1px solid #ddd; margin-bottom: 5px; }
    .eta-row { font-size: 13px; margin: 2px 0; display: flex; justify-content: space-between; }
    .eta-time { font-weight: bold; }
    .bus-marker { display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; border: 2px solid #333; font-size: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
</style>
</head><body><div id="map"></div>
<script>
    const map = L.map('map').setView([8.285, -62.73], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    let userRoutePolyline;
    const busMarkers = {}; // Diccionario: { busId: Marker }
    const stopMarkers = {}; 

    document.addEventListener("message", function(event) {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'INITIALIZE':
                // Ruta estática (azul)
                L.polyline(data.route.map(p => [p.lat, p.lon]), { color: '#007bff', weight: 4, opacity: 0.6 }).addTo(map);
                
                // Paradas
                data.stops.forEach(stop => {
                    const m = L.marker([stop.lat, stop.lon], { icon: L.divIcon({ html: '🏢', iconSize: [25, 25] }) }).addTo(map);
                    m.bindPopup(\`<div class="popup-title">\${stop.name}</div><div>Esperando datos...</div>\`);
                    stopMarkers[stop.id] = m;
                });
                break;
            
            case 'SERVER_UPDATE':
                // 1. Actualizar/Crear Buses
                const activeIds = [];
                data.payload.buses.forEach(bus => {
                    activeIds.push(bus.id);
                    // Icono dinámico con color
                    const customIcon = L.divIcon({ 
                        html: '🚌', 
                        className: 'bus-marker', 
                        iconSize: [30, 30],
                        bgPos: [0, 0],
                        style: 'border-color: ' + bus.color 
                    });

                    if (busMarkers[bus.id]) {
                        busMarkers[bus.id].setLatLng(bus.coords);
                    } else {
                        // Nuevo Bus
                        const m = L.marker(bus.coords, { icon: customIcon, zIndexOffset: 1000 }).addTo(map);
                        m.bindPopup('<b>' + bus.name + '</b><br>Vel: ' + bus.speed + ' km/h');
                        busMarkers[bus.id] = m;
                    }
                });

                // Eliminar buses que ya no existen en el backend
                Object.keys(busMarkers).forEach(id => {
                    if (!activeIds.includes(id)) {
                        map.removeLayer(busMarkers[id]);
                        delete busMarkers[id];
                    }
                });

                // 2. Actualizar Popups de Paradas (Multi ETA)
                Object.keys(data.payload.stopsEtas).forEach(stopId => {
                    const marker = stopMarkers[stopId];
                    if (!marker) return;

                    const etas = data.payload.stopsEtas[stopId];
                    let content = '';
                    if (etas.length === 0) content = '<i>Sin buses próximos</i>';
                    else {
                        etas.forEach(e => {
                            let timeStr = e.eta < 1 ? 'Llegando' : Math.round(e.eta) + ' min';
                            content += \`<div class="eta-row">
                                <span style="color:\${e.color}">\${e.busName}:</span> 
                                <span class="eta-time">\${timeStr}</span>
                            </div>\`;
                        });
                    }
                    // Solo actualizamos si el popup no está abierto o para refrescar datos
                    // (Nota: Leaflet a veces cierra el popup si seteas contenido, usar con cuidado, aquí simplificado)
                    const oldContent = marker.getPopup().getContent();
                    // Usamos una clase wrapper para no perder el titulo
                    if(oldContent) {
                        const title = oldContent.split('</div>')[0] + '</div>'; 
                        marker.setPopupContent(title + content);
                    }
                });
                break;

            case 'UPDATE_USER':
                if (!window.userMarker) {
                    window.userMarker = L.marker(data.coords, { icon: L.divIcon({ html: '🔵', className: 'user-marker-icon', iconSize: [20, 20] }) }).addTo(map);
                } else { window.userMarker.setLatLng(data.coords); }
                break;

            case 'DRAW_USER_ROUTE':
                if (userRoutePolyline) map.removeLayer(userRoutePolyline);
                userRoutePolyline = L.polyline(data.route, { color: '#17a2b8', weight: 4, dashArray: '5, 10' }).addTo(map);
                break;
        }
    });
</script></body></html>`;

// Utilidad para decodificar OSRM
function decodePolyline(encoded) { let points=[],index=0,len=encoded.length,lat=0,lng=0;while(index<len){let b,shift=0,result=0;do{b=encoded.charCodeAt(index++)-63;result|=(b&0x1f)<<shift;shift+=5;}while(b>=0x20);let dlat=((result&1)?~(result>>1):(result>>1));lat+=dlat;shift=0;result=0;do{b=encoded.charCodeAt(index++)-63;result|=(b&0x1f)<<shift;shift+=5;}while(b>=0x20);let dlng=((result&1)?~(result>>1):(result>>1));lng+=dlng;points.push([lat/1e5,lng/1e5]);}return points;}

export default function App() {
    const webviewRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const [nearestStop, setNearestStop] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    
    // Obtener datos estáticos del motor
    const { route, stops } = busEngine.getInitialData();

    // 1. Inicialización del Mapa
    const onMapLoad = () => {
        const initialData = { type: 'INITIALIZE', route, stops };
        webviewRef.current.postMessage(JSON.stringify(initialData));
        setMapReady(true);
        busEngine.start(); // Iniciamos el motor automáticamente (estará vacío hasta que inyectes buses)
    };

    // 2. Suscripción al Motor (Base de Datos simulada)
    useEffect(() => {
        if (!mapReady) return;
        const handleUpdate = (payload) => {
            webviewRef.current.postMessage(JSON.stringify({ type: 'SERVER_UPDATE', payload }));
        };
        busEngine.subscribe(handleUpdate);
        return () => busEngine.unsubscribe(handleUpdate);
    }, [mapReady]);

    // 3. Ubicación de Usuario y Parada más cercana
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            
            // Simular ubicación si estás en emulador sin GPS (o usar la real)
            // nomas para probar
            //const userCoords = { lat: 8.286, lon: -62.724 }; 
            let location = await Location.getCurrentPositionAsync({});
            const userCoords = { lat: location.coords.latitude, lon: location.coords.longitude };
            
            
            
            setUserLocation(userCoords);

            // Buscar parada más cercana
            let closest = { dist: Infinity, stop: null };
            stops.forEach(stop => {
                const dist = haversineDistance(userCoords, stop);
                if (dist < closest.dist) closest = { dist, stop };
            });
            setNearestStop(closest);
        })();
    }, []);

    //  Dibujar ruta Usuario -> Parada (OSRM)
    useEffect(() => {
        if (userLocation && nearestStop && mapReady) {
            // Actualizar punto azul
            webviewRef.current.postMessage(JSON.stringify({ type: 'UPDATE_USER', coords: [userLocation.lat, userLocation.lon] }));
            
            const fetchRoute = async () => {
                const from = `${userLocation.lon},${userLocation.lat}`; 
                const to = `${nearestStop.stop.lon},${nearestStop.stop.lat}`;
                try {
                    const response = await fetch(`http://router.project-osrm.org/route/v1/walking/${from};${to}?overview=full&geometries=polyline`);
                    const json = await response.json();
                    if (json.routes && json.routes.length > 0) {
                        const decodedRoute = decodePolyline(json.routes[0].geometry);
                        webviewRef.current.postMessage(JSON.stringify({ type: 'DRAW_USER_ROUTE', route: decodedRoute }));
                    }
                } catch (error) { console.error("Error OSRM:", error); }
            };
            fetchRoute();
        }
    }, [userLocation, nearestStop, mapReady]);

    return (
        <SafeAreaView style={styles.container}>
            <WebView ref={webviewRef} source={{ html: generateMapHTML() }} onLoad={onMapLoad} javaScriptEnabled={true} style={{ flex: 1 }} />
            
            <View style={styles.controlsContainer}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Tu ubicación</Text>
                    {nearestStop ? (
                        <Text style={styles.infoText}>
                            Más cercana: <Text style={{fontWeight:'bold'}}>{nearestStop.stop.name}</Text>
                            {'\n'}Caminata: {(nearestStop.dist).toFixed(0)} metros
                        </Text>
                    ) : <Text>Calculando...</Text>}
                </View>
                <Button title="⚙️ Admin / Inyectar Buses" onPress={() => setIsAdminOpen(true)} />
            </View>

            {isAdminOpen && (
                <AdminPanel onClose={() => setIsAdminOpen(false)} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, marginTop: Platform.OS === 'android' ? 25 : 0 },
    controlsContainer: { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    infoBox: { flex: 1 },
    infoTitle: { fontWeight: 'bold', fontSize: 14, color: '#0056b3' },
    infoText: { fontSize: 12, marginTop: 2, color: '#333' }
});