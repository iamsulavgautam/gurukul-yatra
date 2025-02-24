import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Services() {
  return (
    <View style={styles.container}>
      {/* Gurukul Yatra Title */}
      <Text style={styles.title}>Gurukul Yatra</Text>

      {/* Marketing Slogan */}
      <Text style={styles.subtitle}>Made to make your ease locomotion</Text>

      {/* Service Information */}
      <Text style={styles.serviceInfo}>
        Currently, we offer{" "}
        <Text style={styles.bold}>ride-sharing</Text> and{" "}
        <Text style={styles.bold}>transportation</Text> from{" "}
        <Text style={styles.bold}>Auto Rickshaw only</Text>, but other services
        will be added soon.
      </Text>

      {/* Call to Action Slogan */}
      <Text style={styles.slogan}>Use Gurukul Yatra for Yatra!</Text>
    </View>
  );
}

// 🖌️ Custom Styles for React Native
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "TT Octosquares",
    fontSize: 40,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "300",
    color: "#666",
    marginBottom: 40,
  },
  serviceInfo: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 60,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "bold",
  },
  slogan: {
    fontSize: 18,
    fontWeight: "500",
    color: "#222",
    fontStyle: "italic",
  },
});
