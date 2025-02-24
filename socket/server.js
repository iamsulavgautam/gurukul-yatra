const express = require("express");
const { WebSocketServer } = require("ws");
const geolib = require("geolib");

const app = express();
const PORT = 4000;

// Store driver locations
let drivers = {};

// Create WebSocket server
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data); // Debugging line

      if (data.type === "locationUpdate" && data.role === "driver") {
        drivers[data.driver] = {
          latitude: data.data.latitude,
          longitude: data.data.longitude,
        };
        console.log("Updated driver location:", drivers[data.driver]); // Debugging line
      }

      if (data.type === "locationUpdate" && data.role === "driver") {
        drivers[data.driver] = {
          latitude: data.data.latitude,
          longitude: data.data.longitude,
          vehicle_type: data.vehicle_type || "default", // Ensure vehicle type exists
        };
        console.log("Updated driver location:", drivers[data.driver]);
      }
      
    } catch (error) {
      console.log("Failed to parse WebSocket message:", error);
    }
  });
});

const findNearbyDrivers = (userLat, userLon) => {
  return Object.entries(drivers)
    .filter(([id, location]) => {
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        location
      );
      return distance <= 5000; // 5 kilometers
    })
    .map(([id, location]) => ({ id, ...location }));
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
