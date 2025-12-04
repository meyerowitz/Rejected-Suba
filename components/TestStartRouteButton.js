import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import StartRouteModal from './StartRouteModal';

//Pantalla de prueba que muestra un botón para abrir el modal.
//los props `openDuration`, `closeDuration` y `animationSize`
//para ver el comportamiento.

export default function TestStartRouteButton() {
  const [visible, setVisible] = useState(false);

  const handleConfirm = () => {
    setVisible(false);
    Alert.alert('Ruta iniciada', 'La ruta ha sido marcada como iniciada.');
  };

  const exampleOpenDuration = 450; // ms al abrir
  const exampleCloseDuration = 220; // ms al cerrar
  const exampleAnimationSize = { width: 180, height: 130 }; // para modificar tamaño de la animación del bus

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
        <Text style={styles.buttonText}>Iniciar ruta</Text>
      </TouchableOpacity>

      <StartRouteModal
        visible={visible}
        onConfirm={handleConfirm}
        onClose={() => setVisible(false)}
        openDuration={exampleOpenDuration}
        closeDuration={exampleCloseDuration}
        animationSize={exampleAnimationSize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#BF1A21',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
