import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { useSharedValue } from "react-native-reanimated";
import SwitchComponent from "./Switch";

const OptionRow = ({
  iconName,
  iconType = "Ionicons",
  text,
  onPress,
  showChevron = true,
  isLogout = false,
}) => (
  <Pressable
    style={isLogout ? styles.logoutOption : styles.option}
    onPress={onPress}
  >
    {!isLogout &&
      (iconType === "Ionicons" ? (
        <Ionicons name={iconName} size={24} color="#555" />
      ) : (
        <MaterialCommunityIcons name={iconName} size={24} color="#555" />
      ))}

    <Text style={isLogout ? styles.logoutText : styles.optionText}>{text}</Text>

    {showChevron && !isLogout && (
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#999"
        style={styles.chevron}
      />
    )}
  </Pressable>
);

const Config = () => {
  const darkMode = useSharedValue(0);
  const notiEnabled = useSharedValue(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerRow}>
            <Ionicons
              name="arrow-back"
              size={25}
              color="white"
              style={styles.backIcon}
            />
            <Ionicons name="settings-outline" size={25} color="white" />
            <Text style={styles.headerText}>Configuración</Text>
          </View>
        </View>
      </View>

      <View style={styles.backgroundContent} />

      <ScrollView
        style={styles.floatingCardContainer}
        contentContainerStyle={styles.floatingCardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.floatingCard}>
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.profileImageContainer}>
                <Ionicons name="person-circle" size={50} color="#333" />
              </View>
              <Text style={styles.profileNameOnCard}>Delcy Rodriguez</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <Text style={styles.sectionHeader}>Configuración de cuenta</Text>
          <OptionRow text="Editar perfil" showChevron={true} />
          <OptionRow text="Cambiar contraseña" showChevron={true} />
          <OptionRow
            text="Verificar usuario"
            showChevron={true}
            iconType="MaterialCommunityIcons"
          />

          <View style={styles.switchRow}>
            <View style={styles.switchRowLeft}>
              <Text style={styles.optionText}>Notificaciones</Text>
            </View>

            <SwitchComponent
              value={notiEnabled}
              onPress={() =>
                (notiEnabled.value = notiEnabled.value === 1 ? 0 : 1)
              }
              style={styles.customSwitch}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchRowLeft}>
              <Text style={styles.optionText}>Modo oscuro</Text>
            </View>

            <SwitchComponent
              value={darkMode}
              onPress={() => (darkMode.value = darkMode.value === 1 ? 0 : 1)}
              style={styles.customSwitch}
            />
          </View>

          <View style={styles.verticalSpacer} />

          <Text style={styles.sectionHeader}>More</Text>
          <OptionRow text="Política de privacidad" showChevron={true} />
          <OptionRow text="Términos y condiciones" showChevron={true} />

          <OptionRow
            text="Cerrar sesión"
            isLogout={true}
            showChevron={false}
            onPress={() => console.log("Cerrar sesión")}
          />

          <View style={styles.extraCardPadding} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Config;

const CARD_MARGIN_TOP = 100;
const CARD_MARGIN_HORIZONTAL = 15;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#DC8E10",
  },

  header: {
    width: "100%",
    height: 300,
    backgroundColor: "#DC8E10",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderEndEndRadius: 20,
    borderEndStartRadius: 20,
  },
  headerTopRow: {
    paddingTop: 25,
    paddingBottom: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    marginRight: 10,
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
  },

  backgroundContent: {
    flex: 1,
    backgroundColor: "#eeeeee",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },

  floatingCardContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: CARD_MARGIN_HORIZONTAL,
  },

  floatingCardContent: {
    flexGrow: 1,
  },
  floatingCard: {
    backgroundColor: "white",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    flexGrow: 1,
    justifyContent: "space-between",
  },

  profileCard: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  profileImageContainer: {
    borderRadius: 25,
    overflow: "hidden",
  },
  profileNameOnCard: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 15,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },

  verticalSpacer: {
    flex: 1,
    minHeight: 20,
  },

  sectionHeader: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    justifyContent: "space-between",
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    color: "#333",
    marginLeft: 15,
  },
  chevron: {
    marginLeft: "auto",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  switchRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  customSwitch: {
    width: 50,
    height: 25,
  },

  logoutOption: {
    paddingVertical: 15,
    marginTop: 10,
    borderBottomColor: "transparent",
  },
  logoutText: {
    fontSize: 18,
    color: "red",
    fontWeight: "500",
    marginLeft: 0,
  },

  extraCardPadding: {
    height: 20,
  },
});
