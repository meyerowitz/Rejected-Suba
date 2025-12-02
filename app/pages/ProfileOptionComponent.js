import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ProfileOptionComponent = ({ iconName, label, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonContainer,

        pressed ? styles.buttonPressed : {},
      ]}
    >
      <View style={styles.iconBox}>
        <Ionicons name={iconName} size={24} color="black" />
      </View>

      <Text style={styles.labelText}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 3,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  iconBox: {
    backgroundColor: "#DC8E10",
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  labelText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default ProfileOptionComponent;
