import React, { useState } from 'react';
import { 
    SafeAreaView, 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    StatusBar,
    Dimensions,
    TextInput,
    ScrollView,
    ImageBackground, 
    Image, 
} from 'react-native';

const { width, height } = Dimensions.get('window');

// COLORES
const COLORS = {
    primaryBlue: '#102957',     
    secondaryOrange: '#FF9800',
    white: '#FFFFFF',
    darkText: '#333333',
    lightGray: '#F0F0F0',       
    inputBorder: '#CCCCCC',     
    neutralGray: '#666666',   
    gris: '#F2F2F2',  
};

// Rutas de las imágenes (usamos require() para recursos locales)
const BACKGROUND_IMAGE_SOURCE = require('./assets/Travel.png'); 

// Simulamos los iconos de tu carpeta assets:
const ASSET_IMAGES = {
    PROFILE_PLACEHOLDER: require('./assets/perfil.png'), // Asume que tienes este placeholder
    NAV_HOME_ACTIVE: require('./assets/home_activo.png'), // Icono Home activo (azul)
    NAV_LOCATION_ACTIVE: require('./assets/ubi_activo.png'), // Icono Location activo (azul)
    SEARCH_ICON: require('./assets/icono_flechas.png'),
    ICON_LOCATION: require('./assets/icono_ubicacion.png'),
};

const TravelHomeScreen = () => {

    // Simulamos que el origen se carga del back-end y no se edita
    const [origen, setOrigen] = useState('Parada Principal Sur'); 
    // Usaremos esta variable para mostrar el destino seleccionado
    const [destinoSeleccionado, setDestinoSeleccionado] = useState('Selecciona tu destino'); 
    const userName = "Miguel Gomez"; 
    
    // Simulación de la foto de perfil (null para no foto, o URI para foto)
    const [profileImageUri, setProfileImageUri] = useState(null); // Cambia a { uri: 'url_de_tu_foto' } para probar con foto
    
    // Estado para navegación activa en el footer
    const [activeTab, setActiveTab] = useState('home');

    // Funciones
    const goToProfile = () => console.log("Navegar a Perfil");
    const searchRoute = () => console.log("Buscar Ruta");
    const openDestinationDropdown = () => console.log("Abrir modal o dropdown de Destino");

    // --- RENDERIZADO DEL BOTÓN DE PERFIL ---
    const renderProfileButton = () => {
        return (
            <TouchableOpacity style={styles.profileButton} onPress={goToProfile}>
                {profileImageUri ? (
                    // Si hay foto de perfil, la mostramos
                    <Image
                        source={profileImageUri}
                        style={styles.profileImage}
                        resizeMode="cover"
                    />
                ) : (
                    // Si no hay foto de perfil, mostramos el placeholder
                    <Image
                        source={ASSET_IMAGES.PROFILE_PLACEHOLDER}
                        style={styles.profilePlaceholderIcon}
                        resizeMode="contain"
                    />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            
            <ImageBackground 
                source={BACKGROUND_IMAGE_SOURCE} 
                style={styles.backgroundImage}
                resizeMode="cover" 
            >
                {/* Contenido del Header */}
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greetingText}>Hola</Text>
                        <Text style={styles.greetingText}>{userName}</Text>
                        <Text style={styles.welcomeText}>¡Bienvenido de nuevo!</Text>
                    </View>
                    {renderProfileButton()}
                </View>

            </ImageBackground>


            <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollViewStyle}>
                
                 {/* Barra de Búsqueda Flotante (Search) */}
                <TouchableOpacity style={styles.searchBar} onPress={() => console.log("Abrir Búsqueda General")}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar..."
                        placeholderTextColor={COLORS.neutralGray}
                        editable={false} 
                    />
                    <Text style={styles.searchIcon}>🔍</Text>
                </TouchableOpacity>


                {/* Card de Saldo Flotante (Naranja) */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceTitle}>Saldo actual</Text>
                    <Text style={styles.balanceAmount}>Bs. 54.59</Text>
                </View>

                {/* --- SECCIÓN DE RUTA (Origen, Destino y Botón) --- */}
                {/* Usamos un contenedor Flexbox (routeSectionWrapper) para alinear todo horizontalmente */}
                <View style={styles.routeSectionWrapper}>
                    
                    {/* Contenedor de Origen y Destino */}
                    <View style={styles.routeInputsContainer}>
                        
                        {/* Campo de Origen (Solo Lectura) */}
                        <View style={styles.routeFieldContainer}>
                            <View style={styles.labelWithIcon}>
                                <Image
                                    source={ASSET_IMAGES.NAV_LOCATION_ACTIVE}
                                    style={styles.labelIcon}
                                />
                                <Text style={styles.routeLabel}>Origen</Text>
                            </View>
                            <TextInput
                                style={styles.textInput}
                                value={origen}
                                editable={false}
                            />
                        </View>

                        {/* Campo de Destino (Dropdown - Desplegable) */}
                        <View style={styles.routeFieldContainer}>
                            <View style={styles.labelWithIcon}>
                                <Image
                                    source={ASSET_IMAGES.NAV_LOCATION_ACTIVE}
                                    style={styles.labelIcon}
                                />
                                <Text style={styles.routeLabel}>Destino</Text>
                            </View>
                            <TouchableOpacity 
                                style={[styles.textInput, styles.dropdownInput]}
                                onPress={openDestinationDropdown}
                            >
                                <Text style={[styles.dropdownText, destinoSeleccionado === 'Selecciona tu destino' && { color: COLORS.neutralGray }]}>
                                    {destinoSeleccionado}
                                </Text>
                                <Text style={styles.dropdownIcon}>▼</Text>
                            </TouchableOpacity>
                        </View>

                    <TouchableOpacity style={styles.searchButton} onPress={searchRoute}>
                        <Image
                            source={ASSET_IMAGES.SEARCH_ICON}
                            style={styles.searchButtonImage} // Nuevo estilo para la imagen
                        />
                    </TouchableOpacity>

                   </View>


                </View>
            </ScrollView>
            
            {/* --- BARRA INFERIOR --- */}
            <View style={styles.footerNav}>
                
                {/* Botón Home */}
                <TouchableOpacity style={styles.navButton} onPress={() => setActiveTab('home')}>
                    <Image 
                    source={ASSET_IMAGES.NAV_HOME_ACTIVE}
                        style={styles.navImage}
                    />
                </TouchableOpacity>
                
                {/* Botón Location */}
                <TouchableOpacity style={styles.navButton} onPress={() => setActiveTab('location')}>
                    <Image 
                        source={ASSET_IMAGES.NAV_LOCATION_ACTIVE}
                        style={styles.navImage}
                    />
                </TouchableOpacity>
                {/* Agregar más botones de navegación aquí si es necesario */}
            </View>
        </SafeAreaView>
    );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: 'transparent',
    },

    // --- FONDO DE IMAGEN ---
    backgroundImage: {
        height: height, 
        position: 'absolute',
        width: '100%',
        top: 0,
        zIndex: 0,
    },
    
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingTop: 30, 
        
    },
    greetingText: {
        fontSize: 24, // Ajustado el tamaño para que quepa mejor el nombre en dos líneas
        fontWeight: 'bold',
        color: COLORS.white,
        lineHeight: 28,
    },
    welcomeText: {
        fontSize: 25, // Ajustado el tamaño
        fontWeight: 'bold', 
        color: COLORS.white,
        lineHeight: 50,
        marginLeft: 30,
        marginTop: 25, // Espacio entre el nombre y el saludo
    },
    
    // --- BOTÓN DE PERFIL ---
    profileButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.white,
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 70, // Importante para que la imagen se adapte al círculo
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    profilePlaceholderIcon: {
        width: '60%', // Tamaño del placeholder dentro del borde
        height: '60%',
        tintColor: COLORS.white, // Opcional: para darle color al placeholder si es SVG o PNG de un solo color
    },
    
    // Barra de Búsqueda Flotante
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 15,
        marginHorizontal: 5,
        position: 'absolute',
        bottom: 20, 
        left: 25,
        right: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        elevation: 5,
        shadowColor: COLORS.darkText,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        zIndex: 3,
        marginBottom: 420,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.darkText,
        paddingVertical: 0,
    },
    searchIcon: {
        fontSize: 20,
        color: COLORS.neutralGray,
    },

    // --- CONTENIDO SCROLLABLE ---
    scrollViewStyle: {
        flex: 1,
        zIndex: 1,
    },
    scrollViewContent: {
        // Ajustamos la altura de paddingTop para compensar el nuevo tamaño de backgroundImage
        paddingTop: height * 0.45 - 50, 
        paddingHorizontal: 25,
        backgroundColor: 'transparent', 
        minHeight: height * 0.6, 
    },

    // Card de Saldo Flotante (Naranja)
    balanceCard: {
        backgroundColor: COLORS.secondaryOrange,
        borderRadius: 15,
        padding: 20,
        alignItems: 'flex-start',
        marginBottom: 10, 
        marginTop: -20, // Levantado para superponerse al fondo de imagen
        elevation: 8,
        shadowColor: COLORS.darkText,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        marginHorizontal: 0, 
    },
    balanceTitle: {
        fontSize: 18,
        color: COLORS.white,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    
    // Contenedor principal de Origen/Destino/Botón
    routeSectionWrapper: {
        flexDirection: 'row', // Alinea los contenedores de ruta y el botón horizontalmente
        alignItems: 'flex-start', // Alinea el botón con la parte inferior de los campos de ruta
        paddingTop: 30, 
        paddingBottom: 20,       
        padding: 15,
        marginTop: 5, // Para que el fondo blanco empiece más arriba
    },

    // Contenedor que agrupa Origen y Destino (debe ocupar la mayor parte del espacio)
    routeInputsContainer: {
        flex: 1, // Toma todo el espacio disponible menos el botón
        marginRight: 10, // Espacio antes del botón de búsqueda
    },

    // Campos de Ruta individuales
    routeFieldContainer: {
        marginBottom: 15, // Espacio entre Origen y Destino
    },
    // NUEVO ESTILO: Contenedor para el icono y el texto del label
    labelWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8, // Espacio entre el label (icono + texto) y el input
    },
    // NUEVO ESTILO: Icono dentro del label
    labelIcon: {
        width: 20, // Ajusta el tamaño del icono
        height: 20,
        resizeMode: 'contain',
        tintColor: COLORS.darkText, // Para que el icono sea del mismo color que el texto del label
        marginRight: 8, // Espacio entre el icono y el texto "Origen"/"Destino"
    },

    routeLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.darkText,
        marginBottom: 8,
    },
    textInput: {
        height: 60,
        borderColor: COLORS.inputBorder,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 18,
        color: COLORS.darkText,
        backgroundColor: COLORS.lightGray, // Usamos lightGray para campos no editables/seleccionables
        justifyContent: 'center', // Para centrar el texto en el TouchableOpacity
    },

    // Estilos específicos para el campo de Destino (Dropdown)
    dropdownInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 15,
        backgroundColor: COLORS.white, // Blanco para el campo de selección
    },
    dropdownText: {
        fontSize: 18,
        color: COLORS.darkText,
    },
    dropdownIcon: {
        fontSize: 12,
        color: COLORS.darkText,
    },
    
    // --- BOTÓN DE BÚSQUEDA (LUPA) ---
    searchButton: {
        backgroundColor: COLORS.gris,
        width: 50,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        
    },
    searchButtonImage: {
        width: 30, // Define el tamaño que tendrá el icono dentro del botón
        height: 30,
        resizeMode: 'contain',
        tintColor: COLORS.primaryBlue,
    },

    // --- BARRA DE NAVEGACIÓN INFERIOR (Footer) ---
    footerNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.white,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderColor: COLORS.inputBorder,
        elevation: 10, 
    },
    navButton: {
        padding: 10,
        alignItems: 'center',
    },
    navImage: {
        width: 40, // Mantiene el tamaño de 30x30
        height: 40,
        resizeMode: 'contain',
        marginBottom: 30,
        marginTop: -10,
    },
});

export default TravelHomeScreen;