import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import styles from "./style";
import { useCallback, useEffect, useRef, useState } from "react";
import { external } from "@/styles/external.style";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { Toast } from "react-native-toast-notifications";
import { useGetUserData } from "@/hooks/useGetUserData";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { router } from "expo-router";
import { Clock, LeftArrow, PickLocation, PickUpLocation } from "@/utils/icons";
import color from "@/themes/app.colors";
import DownArrow from "@/assets/icons/downArrow";
import PlaceHolder from "@/assets/icons/placeHolder";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import axios from "axios";
import _ from "lodash";
import * as Location from "expo-location";
import moment from "moment";
import { parseDuration } from "@/utils/time/parse.duration";
import Button from "@/components/common/button";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

export default function RidePlanScreen() {
  const [places, setPlaces] = useState<any>([]);
  const ws = useRef<any>(null);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<any>({
    latitude: 28.0371064,
    longitude: 82.4734619,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const { user } = useGetUserData() as { user: UserType };
  const notificationListener = useRef<any>();
  const [wsConnected, setWsConnected] = useState(false);
  const [marker, setMarker] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [distance, setDistance] = useState<any>(null);
  const [locationSelected, setLocationSelected] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("Car");
  const [driverLists, setdriverLists] = useState<DriverType[]>([]);
  const [selectedVehcile, setselectedVehcile] = useState("Car");
  const [driverLoader, setdriverLoader] = useState(true);
  const [selectedDriver, setselectedDriver] = useState<DriverType>();
  const [travelTimes, setTravelTimes] = useState({
    driving: null,
    walking: null,
    bicycling: null,
    transit: null,
  });
  const [keyboardAvoidingHeight, setkeyboardAvoidingHeight] = useState(false);
  const [autoRickshaws, setAutoRickshaws] = useState<any[]>([]);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const updateUserPushToken = async (token: string) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/user/update-push-token`,
        {
          userId: user.id,
          pushToken: token,
        }
      );
  
      if (response.status !== 200) {
        throw new Error(`Server responded with status ${response.status}`);
      }
  
      console.log("Push token updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating push token:", error);
      Toast.show("Failed to update push token. Please try again.", {
        type: "danger",
      });
      return false;
    }
  };
  
  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      Toast.show("Must use physical device for Push Notifications", {
        type: "danger",
      });
      return null;
    }
  
    try {
      // Wait for user data to be available
      if (!user || !user.id) {
        console.error("User data not available");
        return null;
      }
  
      // Request/check permissions
      let { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        status = newStatus;
      }
  
      if (status !== "granted") {
        Toast.show("Notification permission denied", { type: "danger" });
        return null;
      }
  
      // Get project ID
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || 
                        Constants?.easConfig?.projectId;
      if (!projectId) {
        Toast.show("Missing Expo project configuration", { type: "danger" });
        return null;
      }
  
      // Get and update token
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Obtained Expo push token:", token);
  
      // Always update token (in case it changed)
      const updateSuccess = await updateUserPushToken(token);
      
      if (!updateSuccess) {
        Toast.show("Failed to save notification settings", { type: "danger" });
        return null;
      }
  
      // Android-specific configuration
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
  
      return token;
    } catch (error) {
      console.error("Push notification setup error:", error);
      Toast.show("Failed to setup notifications", { type: "danger" });
      return null;
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const orderData = {
          currentLocation: notification.request.content.data.currentLocation,
          marker: notification.request.content.data.marker,
          distance: notification.request.content.data.distance,
          driver: notification.request.content.data.orderData,
        };
        router.push({
          pathname: "/(routes)/ride-details",
          params: { orderData: JSON.stringify(orderData) },
        });
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
    };
  }, [user]);

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
      const randomLat = lat + (Math.random() - 0.5) * 0.05; // random variation within 2km
      const randomLon = lon + (Math.random() - 0.5) * 0.05; // random variation within 2km
      nearbyAutos.push({
        id: `${i}`,
        latitude: randomLat,
        longitude: randomLon,
      });
    }
    setAutoRickshaws(nearbyAutos);
  };

  const fetchPlaces = async (input: any) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
            language: "en",
          },
        }
      );
      setPlaces(response.data.predictions);
    } catch (error) {
      console.log(error);
    }
  };

  const debouncedFetchPlaces = useCallback(_.debounce(fetchPlaces, 100), []);

  useEffect(() => {
    if (query.length > 2) {
      debouncedFetchPlaces(query);
    } else {
      setPlaces([]);
    }
  }, [query, debouncedFetchPlaces]);

  const handleInputChange = (text: any) => {
    setQuery(text);
  };
 const initializeWebSocket = useCallback(() => {
  // Use Render's default HTTPS port with proper URL format
  const wsUrl = "wss://gurukul-yatra-1.onrender.com"; 
  
  // Add connection timeout
  const timeout = setTimeout(() => {
    if (ws.current?.readyState === WebSocket.CONNECTING) {
      ws.current.close();
      Toast.show("Connection timeout", {type: "danger"});
    }
  }, 10000);

  ws.current = new WebSocket(wsUrl);

  ws.current.onopen = () => {
    clearTimeout(timeout);
    console.log("✅ Authenticated connection");
    setWsConnected(true);
  };

  ws.current.onerror = (e:any) => {
    console.error("Connection error:", e.message);
    Toast.show("Connection error", {type: "danger"});
  };

  ws.current.onclose = (e:any) => {
    clearTimeout(timeout);
    console.log(`Connection closed (${e.code})`);
  };
}, []);

  useEffect(() => {
    initializeWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const fetchTravelTimes = async (origin: any, destination: any) => {
    const modes = ["driving", "walking", "bicycling", "transit"];
    let travelTimes = {
      driving: null,
      walking: null,
      bicycling: null,
      transit: null,
    } as any;

    for (const mode of modes) {
      let params = {
        origins: `${origin.latitude},${origin.longitude}`,
        destinations: `${destination.latitude},${destination.longitude}`,
        key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
        mode: mode,
      } as any;

      if (mode === "driving") {
        params.departure_time = "now";
      }

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/distancematrix/json`,
          { params }
        );

        const elements = response.data.rows[0].elements[0];
        if (elements.status === "OK") {
          travelTimes[mode] = elements.duration.text;
        }
      } catch (error) {
        console.log(error);
      }
    }

    setTravelTimes(travelTimes);
  };

  const handlePlaceSelect = async (placeId: any) => {

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          },
        }
      );
      const { lat, lng } = response.data.result.geometry.location;

      const selectedDestination = { latitude: lat, longitude: lng };
      setRegion({
        ...region,
        latitude: lat,
        longitude: lng,
      });
      setMarker({
        latitude: lat,
        longitude: lng,
      });
      setPlaces([]);
      requestNearbyDrivers();
      setLocationSelected(true);
      setkeyboardAvoidingHeight(false);
      if (currentLocation) {
        await fetchTravelTimes(currentLocation, selectedDestination);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const calculateDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  };

  const getDriversData = async (drivers: any) => {
    // Extract driver IDs from the drivers array
    const driverIds = drivers.map((driver: any) => driver.id).join(",");
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/get-drivers-data`,
      {
        params: { ids: driverIds },
      }
    );

    const driverData = response.data;
    setdriverLists(driverData);
    setdriverLoader(false);
  };

  const getEstimatedArrivalTime = (travelTime: any) => {
    const now = moment();
    const travelMinutes = parseDuration(travelTime);
    const arrivalTime = now.add(travelMinutes, "minutes");
    return arrivalTime.format("hh:mm A");
  };

  const getNearbyDrivers = () => {
    ws.current.onmessage = async (e: any) => {
      try {
        const message = JSON.parse(e.data);
        if (message.type === "nearbyDrivers") {
          await getDriversData(message.drivers);
        }
      } catch (error) {
        console.log(error, "Error parsing websocket");
      }
    };
  };

  useEffect(() => {
    if (marker && currentLocation) {
      const dist = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        marker.latitude,
        marker.longitude
      );
      setDistance(dist);
    }
  }, [marker, currentLocation]);

  const requestNearbyDrivers = () => {
    console.log(wsConnected);
    if (currentLocation && wsConnected) {
      ws.current.send(
        JSON.stringify({
          type: "requestRide",
          role: "user",
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        })
      );
      getNearbyDrivers();
    }
  };
  const sendPushNotification = async (expoPushToken: string, data: any) => {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "New Ride Request",
      body: "You have a new ride request.",
      data: { orderData: data },
    };
    await axios
      .post("https://exp.host/--/api/v2/push/send", message)
      .catch((error) => {
        console.log(error);
      });
  };
  const handleOrder = async () => {
    try {
      // Get the location names
      const currentLocationName = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLocation?.latitude},${currentLocation?.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
      );
      const destinationLocationName = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${marker?.latitude},${marker?.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
      );
  
      // Prepare the data for notifications
      const data = {
        user,
        currentLocation,
        marker,
        distance: distance.toFixed(2),
        currentLocationName: currentLocationName.data.results[0].formatted_address,
        destinationLocation: destinationLocationName.data.results[0].formatted_address,
      };
  
      console.log("Driver Push Notification IDs:", driverLists.map((driver) => driver.pushNotificationId));
  
      // Loop through driverLists and send notification to drivers with a valid pushNotificationId
      const notificationPromises = driverLists.map(async (driver) => {
        const driverPushToken = driver.pushNotificationId;
        if (driverPushToken) {
          console.log("Sending notification to:", driverPushToken); // Log which driver the notification is sent to
          await sendPushNotification(driverPushToken, data); // Send the notification with the full data (no need to stringify)
        }
      });
  
      // Wait for all notifications to be sent
      await Promise.all(notificationPromises);
  
      Toast.show("Ride request sent to nearby drivers!", {
        type: "success",
        placement: "bottom",
      });
  
    } catch (error) {
      console.error("Error in handleOrder:", error);
      Toast.show("Error sending ride request. Please try again.", {
        type: "error",
        placement: "bottom",
      });
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={[external.fx_1]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View>
        <View
          style={{
            height: windowHeight(!keyboardAvoidingHeight ? 500 : 300),
          }}
        >
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
            {marker && <Marker coordinate={marker} />}
            {currentLocation && <Marker coordinate={currentLocation} />}
            {currentLocation && marker && (
              <MapViewDirections
                origin={currentLocation}
                destination={marker}
                apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
                strokeWidth={4}
                strokeColor="blue"
              />
            )}
          </MapView>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={[styles.container]}>
          {locationSelected ? (
            <>
              {driverLoader ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    height: 400,
                  }}
                >
                  <ActivityIndicator size={"large"} />
                </View>
              ) : (
                <ScrollView
                  style={{
                    paddingBottom: windowHeight(20),
                    height: windowHeight(280),
                  }}
                >
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#b5b5b5",
                      paddingBottom: windowHeight(10),
                      flexDirection: "row",
                    }}
                  >
                    <Pressable onPress={() => setLocationSelected(false)}>
                      <LeftArrow />
                    </Pressable>
                    <Text
                      style={{
                        margin: "auto",
                        fontSize: 20,
                        fontWeight: "600",
                      }}
                    >
                      Gathering options
                    </Text>
                  </View>
                  <View style={{ padding: windowWidth(10) }}>
                  {driverLists?.slice(0, 1).map((driver: DriverType) => (
  <Pressable
    key={driver.id}
    style={{
      width: windowWidth(420),
      borderWidth: selectedVehcile === driver.vehicle_type ? 2 : 0,
      borderRadius: 10,
      padding: 10,
      marginVertical: 5,
    }}
    onPress={() => {
      setselectedVehcile(driver.vehicle_type);
    }}
  >
    <View style={{ margin: "auto" }}>
      <Image
        source={
          driver.vehicle_type === "Car"
            ? require("@/assets/images/vehicles/car.png")
            : driver.vehicle_type === "Motorcycle"
            ? require("@/assets/images/vehicles/bike.png")
            : require("@/assets/images/vehicles/bike.png")
        }
        style={{ width: 90, height: 80 }}
      />
    </View>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text style={{ fontSize: 20, fontWeight: "600" }}>
          Gurukul Yatra {driver.vehicle_type}
        </Text>
        <Text style={{ fontSize: 16 }}>
          {getEstimatedArrivalTime(travelTimes.driving)} dropoff
        </Text>
      </View>
      <Text style={{ fontSize: windowWidth(20), fontWeight: "600" }}>
      NPR {(distance.toFixed(2) * parseInt(driver.rate)).toFixed(2)}
      </Text>
    </View>
  </Pressable>
))}

                    <View
                      style={{
                        paddingHorizontal: windowWidth(10),
                        marginTop: windowHeight(15),
                      }}
                    >
                      <Button
                        backgroundColor={"#000"}
                        textColor="#fff"
                        title={`Confirm Booking`}
                        onPress={() => handleOrder()}
                      />
                    </View>
                  </View>
                </ScrollView>
              )}
            </>
          ) : (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity onPress={() => router.back()}>
                  <LeftArrow />
                </TouchableOpacity>
                <Text
                  style={{
                    margin: "auto",
                    fontSize: windowWidth(25),
                    fontWeight: "600",
                  }}
                >
                  Plan your ride
                </Text>
              </View>
              <View
                style={{
                  width: windowWidth(200),
                  height: windowHeight(28),
                  borderRadius: 20,
                  backgroundColor: color.lightGray,
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: windowHeight(10),
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Clock />
                  <Text
                    style={{
                      fontSize: windowHeight(12),
                      fontWeight: "600",
                      paddingHorizontal: 8,
                    }}
                  >
                    Pick-up now
                  </Text>
                  <DownArrow />
                </View>
              </View>
              <View
                style={{
                  borderWidth: 2,
                  borderColor: "#000",
                  borderRadius: 15,
                  marginBottom: windowHeight(15),
                  paddingHorizontal: windowWidth(15),
                  paddingVertical: windowHeight(5),
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <PickLocation />
                  <View
                    style={{
                      width: Dimensions.get("window").width * 1 - 110,
                      borderBottomWidth: 1,
                      borderBottomColor: "#999",
                      marginLeft: 5,
                      height: windowHeight(20),
                    }}
                  >
                    <Text
                      style={{
                        color: "#2371F0",
                        fontSize: 15,
                        paddingLeft: 5,
                      }}
                    >
                      Current Location
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    paddingVertical: 12,
                  }}
                >
                  <PlaceHolder />
                  <View
                    style={{
                      marginLeft: 5,
                      width: Dimensions.get("window").width * 1 - 110,
                    }}
                  >
               <GooglePlacesAutocomplete
  placeholder="Kaha janeyy?"
  onPress={(data, details = null) => {
    setkeyboardAvoidingHeight(true);
    setPlaces([{
      description: data.description,
      place_id: data.place_id,
    }]);
  }}
  query={{
    key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
    language: "en",
    // Add these parameters for 24km radius
    location: `${currentLocation?.latitude},${currentLocation?.longitude}`,
    radius: 24000, // 24km in meters
    strictbounds: true,
  }}
  styles={{
    textInputContainer: { width: "100%" },
    textInput: {
      height: 38,
      color: "#000",
      fontSize: 16,
    },
    predefinedPlacesDescription: { color: "#000" },
  }}
  textInputProps={{
    onChangeText: (text) => handleInputChange(text),
    value: query,
    onFocus: () => setkeyboardAvoidingHeight(true),
  }}
  onFail={(error) => console.log(error)}
  fetchDetails={true}
  debounce={200}
  // Additional props for location restriction
  currentLocation={true}
  currentLocationLabel="Your current location"
  enablePoweredByContainer={false}
/>
                  </View>
                </View>
              </View>
              {places.map((place: any, index: number) => (
                <Pressable
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: windowHeight(20),
                  }}
                  onPress={() => handlePlaceSelect(place.place_id)}
                >
                  <PickUpLocation />
                  <Text style={{ paddingLeft: 15, fontSize: 18 }}>
                    {place.description}
                  </Text>
                </Pressable>
              ))}
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
