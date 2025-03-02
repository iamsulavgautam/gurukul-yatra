import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { SvgXml } from "react-native-svg";
import LocationSearchBar from "@/components/location/location.search.bar";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import * as Location from "expo-location";
import { Toast } from "react-native-toast-notifications";
import Constants from "expo-constants";
import { router } from "expo-router";

// Get the screen width
const SCREEN_WIDTH = Dimensions.get("window").width;

// Sample Vehicle Data
const vehicles = [
  {
    id: "1",
    name: "Auto Rickshaw",
    icon: require("@/assets/icons/auto_rickshaw.png"),
    background: "#FFFFFF",
    description: "Affordable three-wheeler ride", // ✅ Add this field
  },
];


export default function HomeScreen() {
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [region, setRegion] = useState<any>({
    latitude: 28.0371064,
    longitude: 82.4734619,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });
  const [autoRickshaws, setAutoRickshaws] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show(
          "Please approve your location tracking otherwise you can't use this app!",
          {
            type: "danger",
            placement: "bottom",
          }
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Simulate nearby auto rickshaws
      generateNearbyAutos(latitude, longitude);
    })();
  }, []);

  // Function to generate nearby autos (simulate nearby autos)
  const generateNearbyAutos = (lat: number, lon: number) => {
    const nearbyAutos = [];
    for (let i = 0; i < 10; i++) {
      const randomLat = lat + (Math.random() - 0.5) * 0.02; // random variation within 2km
      const randomLon = lon + (Math.random() - 0.5) * 0.02; // random variation within 2km
      nearbyAutos.push({
        id: `${i}`,
        latitude: randomLat,
        longitude: randomLon,
      });
    }
    setAutoRickshaws(nearbyAutos);
  };

  const handleServicePress = () => {
    router.push("/(routes)/rideplan");
  };

  const handleMapPress = () => {
    router.push("/(routes)/rideplan");
  };

  return (
    <View style={[commonStyles.flexContainer, { backgroundColor: "#fff" }]}>
      <SafeAreaView style={styles.container}>
        {/* Current Location */}
        <View style={styles.currentLocationContainer}>
          <Text style={styles.currentLocationText}>
            Current Location: Ghorahi, Dang
          </Text>
        </View>

        {/* Map */}
        <TouchableOpacity onPress={handleMapPress} style={styles.mapContainer}>
          <MapView
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={(region) => setRegion(region)}
          >
            {marker && <Marker coordinate={marker} />}
            {currentLocation && <Marker coordinate={currentLocation} />}
            {autoRickshaws.map((auto) => (
              <Marker
                key={auto.id}
                coordinate={{
                  latitude: auto.latitude,
                  longitude: auto.longitude,
                }}
                image={require("@/assets/images/vehicles/golo.png")} // Auto Rickshaw Icon
              />
            ))}
            {currentLocation && marker && (
              <MapViewDirections
                origin={currentLocation}
                destination={marker}
                apikey={Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
                strokeWidth={4}
                strokeColor="blue"
              />
            )}
          </MapView>
        </TouchableOpacity>

        <Text style={styles.infoText}>Services :</Text>
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={handleServicePress}>
              <View
                style={[
                  styles.vehicleCard,
                  { backgroundColor: item.background },
                ]}
              >
                <Image source={item.icon} style={styles.icon} />
                <View>
                  <Text style={styles.vehicleName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.description}>{item.description}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />

        {/* Location Search Bar */}
        <View style={[external.ph_20, styles.searchBarContainer]}>
          <LocationSearchBar />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  currentLocationContainer: {
    padding: 15,
    backgroundColor: "#6C63FF",
    alignItems: "center",
  },
  currentLocationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  mapContainer: {
    height: 444,
    marginVertical: 10,
    borderRadius: 24,
    overflow: "hidden",
    paddingLeft: 5,
    paddingRight: 5,
  },
  icon: {
    width: 40,
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
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    width: SCREEN_WIDTH * 0.9,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    paddingLeft: 20,
    marginBottom: 20,
  },
  listContainer: {
    width: "100%",
    alignItems: "center",
  },
  searchBarContainer: {
    marginTop: 15,
    zIndex: 10,
    marginBottom: 20,
  },
});
