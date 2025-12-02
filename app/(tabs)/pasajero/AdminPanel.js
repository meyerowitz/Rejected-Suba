// AdminPanel.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { busEngine, stopsOnly } from './BusEngine';

export default function AdminPanel({ onClose }) {
    const [busName, setBusName] = useState('Ruta Express');
    const [speed, setSpeed] = useState('40');
    const [selectedStop, setSelectedStop] = useState(stopsOnly[0]);
    const [showStopPicker, setShowStopPicker] = useState(false);
    const [activeBuses, setActiveBuses] = useState(busEngine.buses);

    const handleAddBus = () => {
        const id = 'BUS-' + Date.now().toString().slice(-4);
        busEngine.addBus({
            id: id,
            name: busName,
            speedKmh: speed,
            startStopId: selectedStop.id
        });
        setActiveBuses([...busEngine.buses]); // Forzar re-render
    };

    const handleRemoveBus = (id) => {
        busEngine.removeBus(id);
        setActiveBuses([...busEngine.buses]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Panel de Control (Inyección)</Text>
            
            <View style={styles.inputGroup}>
                <Text>Nombre ID:</Text>
                <TextInput style={styles.input} value={busName} onChangeText={setBusName} />
            </View>
            <View style={styles.inputGroup}>
                <Text>Velocidad (km/h):</Text>
                <TextInput style={styles.input} value={speed} onChangeText={setSpeed} keyboardType="numeric" />
            </View>
            
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowStopPicker(true)}>
                <Text style={styles.pickerText}>Inicio: {selectedStop.name}</Text>
            </TouchableOpacity>

            <Button title="Inyectar Autobús" onPress={handleAddBus} color="#28a745" />

            <Text style={styles.subtitle}>Buses Activos ({activeBuses.length})</Text>
            <ScrollView style={styles.list}>
                {activeBuses.map(b => (
                    <View key={b.id} style={styles.listItem}>
                        <Text style={{fontWeight:'bold', color: b.color}}>{b.name}</Text>
                        <Text>{b.speedKmh} km/h</Text>
                        <Button title="X" onPress={() => handleRemoveBus(b.id)} color="red" compact />
                    </View>
                ))}
            </ScrollView>

            <Button title="Cerrar Panel" onPress={onClose} color="#6c757d" />

            {/* Modal simple para seleccionar parada */}
            <Modal visible={showStopPicker} transparent={true} animationType="slide">
                <View style={styles.modalView}>
                    <Text style={styles.title}>Seleccionar Inicio</Text>
                    <ScrollView>
                        {stopsOnly.map(stop => (
                            <TouchableOpacity key={stop.id} style={styles.stopOption} onPress={() => { setSelectedStop(stop); setShowStopPicker(false); }}>
                                <Text>{stop.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <Button title="Cancelar" onPress={() => setShowStopPicker(false)} color="red"/>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
    inputGroup: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 5, flex: 1, marginLeft: 10 },
    pickerBtn: { padding: 10, backgroundColor: '#e9ecef', borderRadius: 5, marginBottom: 10, alignItems: 'center' },
    list: { maxHeight: 150, marginBottom: 10 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalView: { margin: 20, marginTop: 100, backgroundColor: "white", borderRadius: 20, padding: 35, elevation: 5, height: '70%' },
    stopOption: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }
});