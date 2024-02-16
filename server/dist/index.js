"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const socket_1 = require("./socket/socket");
const db_1 = __importDefault(require("./db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const listingRoutes_1 = __importDefault(require("./routes/listingRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
// variables
const port = process.env.PORT || 4000;
const __path = path_1.default.resolve();
// const mode = "production";
const mode = "deployment";
// middleware
socket_1.app.use((0, cors_1.default)());
socket_1.app.use(express_1.default.json());
socket_1.app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
});
// routes
socket_1.app.use("/api/users", userRoutes_1.default);
socket_1.app.use("/api/listings", listingRoutes_1.default);
socket_1.app.use("/api/messages", messageRoutes_1.default);
// static files (for deployment)
if (mode === "deployment") {
    socket_1.app.use(express_1.default.static(path_1.default.join(__path, "/client/build")));
    socket_1.app.get("*", (req, res) => res.sendFile(path_1.default.resolve(__path, "client", "build", "index.html")));
}
// errors
socket_1.app.use((req, res, next) => {
    next(new Error("Endpoint not found"));
});
socket_1.app.use((err, req, res, next) => {
    if (err instanceof Error)
        res.status(500).json({ error: err.message });
    else
        res.status(500).json({ error: "An unknown error occurred" });
});
// listen
db_1.default.connect((error) => {
    if (error)
        throw new Error("Unable to connect to PostgreSQL database");
    console.log("Connected to PostgreSQL database");
    socket_1.server.listen(port, () => {
        console.log(`Server listening on port ${port}...`);
    });
});
