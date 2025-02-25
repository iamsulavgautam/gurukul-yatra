const express = require("express");
const { WebSocketServer } = require("ws");
const geolib = require("geolib");

const app = express();
const PORT = 4000;

// Store driver locations
let drivers = {};

// Add test route
app.get("/api/status", (req, res) => {
  res.json({
    status: "Server is running",
    websocket: "Active on port 8080",
    connectedDrivers: Object.keys(drivers).length,
    sampleDriver: Object.keys(drivers).length > 0 ? 
      drivers[Object.keys(drivers)[0]] : null
  });
});

// Create WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Track WebSocket connections
let wsConnections = 0;

wss.on("connection", (ws) => {
  wsConnections++;
  
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data);

      if (data.type === "locationUpdate" && data.role === "driver") {
        drivers[data.driver] = {
          latitude: data.data.latitude,
          longitude: data.data.longitude,
          timestamp: Date.now()
        };
      }

      if (data.type === "requestRide" && data.role === "user") {
        const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);
        ws.send(
          JSON.stringify({ type: "nearbyDrivers", drivers: nearbyDrivers })
        );
      }
    } catch (error) {
      console.log("Failed to parse WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    wsConnections--;
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
  console.log(`HTTP Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/status`);
  console.log(`WebSocket server running on port 8080`);
});