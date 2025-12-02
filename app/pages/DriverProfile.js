import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  _ScrollView,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import ProfileOptionComponent from "./ProfileOptionComponent";

const CARD_HEIGHT = 180;
const HEADER_HEIGHT = 150;
const DriverProfile = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => {}}>
            <Ionicons name="arrow-back" size={40} color="white" />
          </Pressable>

          <Ionicons name="person-circle-outline" size={40} color="white" />
          <Text style={styles.headerText}>Perfil</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={110} color="#071B3F" />
          </View>

          <Text style={styles.nameText}>Cristiano Ronaldo</Text>
          <Text style={styles.emailText}>Cr7Siuu@gmail.com</Text>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.sectionHeader}>General</Text>

          <ProfileOptionComponent
            iconName="settings-outline"
            label="Ajustes"
            onPress={() => {}}
          />
          <ProfileOptionComponent
            iconName="location-outline"
            label="Rutas"
            onPress={() => {}}
          />
          <ProfileOptionComponent
            iconName="chatbubble-ellipses-outline"
            label="Soporte"
            onPress={() => {}}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },

  header: {
    width: "100%",

    height: 300,
    backgroundColor: "#DC8E10",
    flexDirection: "row",
    justifyContent: "flex-start",

    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,

    borderEndEndRadius: 20,
    borderEndStartRadius: 20,
  },
  headerText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 10,
  },

  profileCard: {
    marginTop: -210,

    alignSelf: "center",
    alignItems: "center",

    width: "90%",
    height: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  emailText: {
    fontSize: 14,
    color: "#888",
  },

  mainContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,

    paddingTop: 30,
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888",
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
    justifyContent: "topleft",
  },
});

export default DriverProfile;
