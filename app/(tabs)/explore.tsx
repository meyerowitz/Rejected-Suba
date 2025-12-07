import { StyleSheet, View } from "react-native"

export default function TabTwoScreen() {
  return (
    <View style={styles.page}>
      <View style={styles.container}></View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    height: 400,
    width: 400,
  },
})