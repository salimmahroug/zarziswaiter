const express = require("express");
const router = express.Router();
const Server = require("../models/Server");

// Get all servers
router.get("/", async (req, res) => {
  try {
    const servers = await Server.find().sort({ createdAt: -1 });
    res.json(servers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single server
router.get("/:id", async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ message: "Serveur non trouvé" });
    }
    res.json(server);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new server
router.post("/", async (req, res) => {
  try {
    const server = new Server(req.body);
    const newServer = await server.save();
    res.status(201).json(newServer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a server
router.put("/:id", async (req, res) => {
  try {
    const server = await Server.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!server) {
      return res.status(404).json({ message: "Serveur non trouvé" });
    }
    res.json(server);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a server
router.delete("/:id", async (req, res) => {
  try {
    const server = await Server.findByIdAndDelete(req.params.id);
    if (!server) {
      return res.status(404).json({ message: "la7wa" });
    }
    res.json({ message: "Serveur supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle server availability
router.put("/:id/toggle-availability", async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ message: "Serveur non trouvé" });
    }
    server.available = !server.available;
    await server.save();
    res.json(server);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
