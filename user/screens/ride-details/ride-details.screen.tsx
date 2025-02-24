import { View, Text, Linking, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import color from "@/themes/app.colors";

export default function RideDetailsScreen() {
  const { orderData: orderDataObj } = useLocalSearchParams() as any;
let orderData;
try {
  orderData = orderDataObj ? JSON.parse(orderDataObj) : null;
} catch (error) {
  console.error("❌ Error parsing orderData:", error);
  orderData = null;
}

console.log("🚀 Received Order Data in RideDetailsScreen:", orderData);
console.log("🔍 Driver Data:", orderData?.driver);
console.log("📞 Driver Phone:", orderData?.driver?.phone_number);
console.log("💰 Ride Price:", orderData?.driver?.rate);
console.log("👤 Driver Name:", orderData?.driver?.name);

if (!orderData?.driver) {
  console.error("❌ Driver data is missing in RideDetailsScreen:", orderData);
}


  const [region, setRegion] = useState<any>({
    latitude: 28.0371064,
    longitude: 82.4734619,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
    
  });

  useEffect(() => {
    if (orderData?.driver?.currentLocation && orderData?.driver?.marker) {
      const latitudeDelta =
        Math.abs(
          orderData.driver.marker.latitude -
            orderData.driver.currentLocation.latitude
        ) * 2;
      const longitudeDelta =
        Math.abs(
          orderData.driver.marker.longitude -
            orderData.driver.currentLocation.longitude
        ) * 2;

      setRegion({
        latitude:
          (orderData.driver.marker.latitude +
            orderData.driver.currentLocation.latitude) /
          2,
        longitude:
          (orderData.driver.marker.longitude +
            orderData.driver.currentLocation.longitude) /
          2,
        latitudeDelta: Math.max(latitudeDelta, 0.0922),
        longitudeDelta: Math.max(longitudeDelta, 0.0421),
      });
    }
  }, []);

  return (
    <View>
      <View style={{ height: windowHeight(450) }}>
        <MapView
          style={{ flex: 1 }}
          region={region}
          onRegionChangeComplete={(region) => setRegion(region)}
        >
          {orderData?.driver?.marker && (
            <Marker coordinate={orderData?.driver?.marker} />
          )}
          {orderData?.driver?.currentLocation && (
            <Marker coordinate={orderData?.driver?.currentLocation} />
          )}
          {orderData?.driver?.currentLocation && orderData?.driver?.marker && (
            <MapViewDirections
              origin={orderData?.driver?.currentLocation}
              destination={orderData?.driver?.marker}
              apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
              strokeWidth={4}
              strokeColor="blue"
            />
          )}
        </MapView>
      </View>
      <View style={{ padding: windowWidth(20) }}>
        <Text
          style={{
            fontSize: fontSizes.FONT20,
            fontWeight: "500",
            paddingVertical: windowHeight(5),
          }}
        >
          Driver Name: {orderData?.driver?.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: fontSizes.FONT20,
              fontWeight: "500",
              paddingVertical: windowHeight(5),
            }}
          >
            Phone Number:
          </Text>
          <Text
            style={{
              color: color.buttonBg,
              paddingLeft: 5,
              fontSize: fontSizes.FONT20,
              fontWeight: "500",
              paddingVertical: windowHeight(5),
            }}
            onPress={() =>
              Linking.openURL(`tel:${orderData?.driver?.phone_number}`)
            }
          >
            {orderData?.driver?.phone_number}
          </Text>
        </View>
        
        <Text
          style={{
            fontSize: fontSizes.FONT20,
            fontWeight: "500",
            paddingVertical: windowHeight(5),
          }}
        >
          Payable amount:{" "}
          {(
            orderData.driver?.distance * parseInt(orderData?.driver?.rate)
          ).toFixed(2)}{" "}
          NPR
        </Text>
        <Text
          style={{
            fontSize: fontSizes.FONT14,
            fontWeight: "400",
            paddingVertical: windowHeight(5),
          }}
        >
          **Pay to your driver after reaching to your destination!
        </Text>
        <TouchableOpacity
      style={{
        backgroundColor: '#1f1f1f', // Set the background color for the button
        paddingVertical: windowHeight(5),
        paddingHorizontal: 20, // Padding for the button
        borderRadius: 5, // Optional: Add border radius to make the button rounded
        alignItems: 'center', // Center the text horizontally
      }}
      onPress={() => router.push('/(tabs)/home')} // Or router.push('/(routes)/rideplan' for Next.js)
    >
      <Text
        style={{
          fontSize: fontSizes.FONT20,
          fontWeight: '500',
          color: '#fff', // Text color for the button
        }}
      >
        Go to Home screen
      </Text>
    </TouchableOpacity>
      </View>
    </View>
  );
}