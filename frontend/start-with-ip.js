const { exec } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Get the local IP address
const getLocalIPAddress = () => {
  const nets = os.networkInterfaces();
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

  // Try to find the most likely externally accessible IP
  let primaryIP = null;

  // First preference: Wi-Fi or Ethernet
  const preferredInterfaces = ["Wi-Fi", "Ethernet", "eth0", "wlan0"];
  for (const iface of preferredInterfaces) {
    if (results[iface] && results[iface].length > 0) {
      primaryIP = results[iface][0];
      break;
    }
  }

  // If we didn't find a preferred interface, just take the first one we find
  if (!primaryIP) {
    for (const iface in results) {
      if (results[iface] && results[iface].length > 0) {
        primaryIP = results[iface][0];
        break;
      }
    }
  }

  return primaryIP || "localhost";
};

// Use fixed IP address instead of auto-detection
const ip = "192.168.100.145";
console.log(`Using fixed IP address: ${ip}`);

// Start the backend server
console.log("Starting backend server...");
const backendProcess = exec(
  "cd backend && node server.cjs",
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Backend error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Backend stderr: ${stderr}`);
      return;
    }
    console.log(`Backend stdout: ${stdout}`);
  }
);

backendProcess.stdout.on("data", (data) => {
  console.log(`Backend: ${data}`);
});

backendProcess.stderr.on("data", (data) => {
  console.error(`Backend error: ${data}`);
});

// Start the frontend server
console.log("Starting frontend server...");
const frontendProcess = exec(
  `npm run dev -- --host ${ip}`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Frontend error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Frontend stderr: ${stderr}`);
      return;
    }
    console.log(`Frontend stdout: ${stdout}`);
  }
);

frontendProcess.stdout.on("data", (data) => {
  console.log(`Frontend: ${data}`);
});

frontendProcess.stderr.on("data", (data) => {
  console.error(`Frontend error: ${data}`);
});

console.log(`
==============================================
🚀 Application running with network access!
==============================================

Backend API: http://${ip}:5001/api
Frontend:   http://${ip}:8080

To access on your phone, connect to the same WiFi network
and visit http://${ip}:8080 in your browser.

Press Ctrl+C to stop all servers.
==============================================
`);

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down servers...");
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});
