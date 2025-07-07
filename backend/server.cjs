const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Routes
const serverRoutes = require("./routes/serverRoutes");
const eventRoutes = require("./routes/eventRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*", // Allow any origin in development
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "Set (hidden for security)" : "NOT SET"
);
console.log("NODE_ENV:", process.env.NODE_ENV);

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not set!");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// API Routes avec préfixe /api
app.use("/api/servers", serverRoutes);
app.use("/api/events", eventRoutes);

// Debug route to confirm server is running
app.get("/", (req, res) => {
  res.send("Zarzis Waiter API is running");
});

// Add a route to check API status
app.get("/api/status", (req, res) => {
  res.json({ status: "API is running", time: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// Listen on all network interfaces to make the server accessible from other devices
app.listen(PORT, "0.0.0.0", () => {
  // Display the available network interfaces to help identify the IP address
  const { networkInterfaces } = require("os");
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  console.log("Network interfaces:", results);
  console.log(`Server running on port ${PORT} and accessible from:`);

  // List all available IP addresses for convenience
  Object.keys(results).forEach((interfaceName) => {
    results[interfaceName].forEach((ip) => {
      console.log(`http://${ip}:${PORT}/api`);
    });
  });
});
