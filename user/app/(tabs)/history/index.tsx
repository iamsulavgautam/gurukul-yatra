import React from "react";
import { View, Text, FlatList, StyleSheet, Image, Dimensions, SafeAreaView } from "react-native";

// Get the screen width
const SCREEN_WIDTH = Dimensions.get("window").width;

// Sample Vehicle Data
const vehicles = [
  { id: "1", name: "Auto Rickshaw", icon: require("@/assets/icons/auto_rickshaw.png"), background: "#FFFFFF" },
  { id: "2", name: "Bike Sharing", description: "(Coming Soon)", icon: require("@/assets/icons/bike_sharing.png"), background: "#EAEAEA" }, // Less white
];

const History: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.infoText}>
        Oh! Currently, we have Auto Rickshaw. More options coming soon!
      </Text>

      {/* Vehicle List */}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.vehicleCard, { backgroundColor: item.background }]}>
            {/* Vehicle Icon */}
            <Image source={item.icon} style={styles.icon} />
            {/* Vehicle Name */}
            <View>
              <Text style={styles.vehicleName}>{item.name}</Text>
              {item.description && <Text style={styles.description}>{item.description}</Text>}
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />

      {/* More Features Coming Soon Message */}
      <Text style={styles.updateText}>🚀 More features will be updated soon! 🚀</Text>
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    padding: 20,
  },
  infoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  listContainer: {
    width: "100%",
    alignItems: "center",
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    width: SCREEN_WIDTH * 0.9, // Ensuring both cards have the same width
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Android shadow
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 15,
    resizeMode: "contain",
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 12, // Smaller text for "Coming Soon"
    color: "#666",
  },
  updateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 20,
  },
});
