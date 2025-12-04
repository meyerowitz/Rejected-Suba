import React, { useEffect, useRef, useState } from 'react';
import { Modal, Animated, StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

// Obtener alto de la pantalla para animar desde abajo
const { height } = Dimensions.get('window');

/**
 * StartRouteModal
 * Componente modal que aparece deslizándose desde abajo (slide up).
 * Props:
 * - visible: boolean para mostrar/ocultar el modal
 * - onConfirm: función llamada al confirmar
 * - onClose: función llamada al cerrar
 * - openDuration: duración (ms) de la animación al abrir
 * - closeDuration: duración (ms) de la animación al cerrar
 * - animationSize: tamaño de la animación del bus
 */
export default function StartRouteModal({
  visible,
  onConfirm,
  onClose,
  openDuration = 350,
  closeDuration = 200,
  animationSize = { width: 120, height: 80 },
}) {
  // Valor animado que controla la traslación vertical del contenedor
  const translateY = useRef(new Animated.Value(height)).current;

  // `showModal` mantiene el Modal montado mientras corre la animación de cierre.
 
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    // Si el modal debe abrirse, primero montamos y luego animamos hacia arriba
    if (visible) {
      setShowModal(true);
      // Asegurarnos de que el valor comience desde fuera de pantalla
      translateY.setValue(height);
      Animated.timing(translateY, {
        toValue: 0,
        duration: openDuration,
        useNativeDriver: true,
      }).start();
    } else if (showModal) {
      // Si `visible` es false pero el modal aún está montado, animamos la salida
      Animated.timing(translateY, {
        toValue: height,
        duration: closeDuration,
        useNativeDriver: true,
      }).start(() => {
        // Al terminar la animación, desmontamos el Modal
        setShowModal(false);
      });
    }
    // Nota: dependencias incluyen showModal y translateY
  }, [visible, openDuration, closeDuration, height, showModal, translateY]);

  // Calcular estilos de la animación según `animationSize`
  let animSizeStyle = {};
  if (typeof animationSize === 'number') {
    animSizeStyle = { width: animationSize, height: animationSize };
  } else if (animationSize && typeof animationSize === 'object') {
    animSizeStyle = {
      width: animationSize.width || 120,
      height: animationSize.height || 80,
    };
  }

  return (
    // Modal transparente para mostrar un backdrop oscuro
    // Usamos `showModal` para que el Modal permanezca visible hasta que termine la animación
    <Modal transparent visible={showModal} animationType="none">
      <View style={styles.backdrop}>
        {/* TouchableOpacity que cierra el modal al tocar fuera */}
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />

        {/* Contenedor animado que hace el slide up / down */}
        <Animated.View style={[styles.container, { transform: [{ translateY }] }] }>
          <View style={styles.handle} />
          <View style={styles.content}>
            <View style={[styles.lottieWrap, animSizeStyle]}>
              {}
              <LottieView
                source={require('../assets/Bus_carga_trackMile.json')}
                autoPlay
                loop
                style={[styles.lottie, animSizeStyle]}
              />
            </View>

            <Text style={styles.title}>¿Iniciar ruta?</Text>
            <Text style={styles.subtitle}>Confirma el inicio de ruta o regresa al menú</Text>

            {/* Botón principal de confirmar */}
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>

            {/* Botón circular para cerrar (X) */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdropTouchable: {
    flex: 1,
  },
  container: {
    maxHeight: height * 0.6,
    backgroundColor: 'transparent',
  },
  content: {
    backgroundColor: '#BF1A21',
    paddingTop: 18,
    paddingBottom: 24,
    paddingHorizontal: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: 'center',
  },
  handle: {
    height: 6,
    width: 60,
    backgroundColor: '#eee',
    alignSelf: 'center',
    marginBottom: -12,
    borderRadius: 4,
  },
  lottieWrap: {
    width: 120,
    height: 80,
    marginBottom: 6,
  },
  lottie: {
    width: '100%',
    height: '100%'
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#DC8E10',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 28,
    width: '80%',
    alignItems: 'center',
    marginTop: 6,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
});
