const express = require("express");
const cors = require("cors");
const { createServer } = require("http"); // Use HTTP server for WebSocket integration
const { WebSocketServer } = require("ws");
const geolib = require("geolib");

const app = express();
const PORT = process.env.PORT || 4000; // Use assigned port or fallback to 4000 locally

app.use(cors({
  origin: '*',  // Allow all origins
}));

// Store driver locations
let drivers = {};

// Add test route
app.get("/api/status", (req, res) => {
  res.json({
    status: "Server is running",
    websocket: "Active",
    connectedDrivers: Object.keys(drivers).length,
    sampleDriver: Object.keys(drivers).length > 0 ? 
      drivers[Object.keys(drivers)[0]] : null
  });
});

// Create HTTP server and attach WebSocket
const server = createServer(app);
const wss = new WebSocketServer({ server }); // Attach WebSocket to HTTP server

// Track WebSocket connections
let wsConnections = 0;

wss.on("connection", (ws) => {
  wsConnections++;
  console.log(`WebSocket connection established. Total connections: ${wsConnections}`);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data);

      if (data.type === "locationUpdate" && data.role === "driver") {
        drivers[data.driver] = {
          latitude: data.data.latitude,
          longitude: data.data.longitude,
          timestamp: Date.now(),
          ws: ws // Store the WebSocket connection for cleanup
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
    console.log(`WebSocket connection closed. Total connections: ${wsConnections}`);
    // Remove driver from the list if they disconnect
    for (const driverId in drivers) {
      if (drivers[driverId].ws === ws) {
        delete drivers[driverId];
        break;
      }
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

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/status`);
});