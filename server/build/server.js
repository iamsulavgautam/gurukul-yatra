"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const server = http_1.default.createServer(app_1.app);
const cors_1 = __importDefault(require("cors")); // Import the CORS middleware
// OR, if you want to enable CORS for specific domains only (recommended for production)
app_1.app.use((0, cors_1.default)({
    origin: '*', // Allow all origins
}));
// create server
server.listen(process.env.PORT, () => {
    console.log(`Server is connected with port ${process.env.PORT}`);
});
