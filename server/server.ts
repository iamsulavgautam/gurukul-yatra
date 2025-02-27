import http from "http";
import { app } from "./app";
const server = http.createServer(app);
import cors from "cors";  // Import the CORS middleware

// OR, if you want to enable CORS for specific domains only (recommended for production)
app.use(cors({
  origin: '*',  // Allow all origins
}));

// create server
server.listen(process.env.PORT, () => {
  console.log(`Server is connected with port ${process.env.PORT}`);
});