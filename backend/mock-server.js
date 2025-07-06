const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let servers = [
  {
    id: "1",
    _id: "1",
    name: "Ahmed Ben Ali",
    phone: "+216 20 123 456",
    available: true,
    totalEvents: 5,
    totalEarnings: 450, // Montant restant après paiements
    payments: [
      {
        amount: 200,
        date: new Date("2025-06-15"),
        remaining: 550,
        paymentMethod: "cash",
        notes: "Paiement partiel",
      },
      {
        amount: 100,
        date: new Date("2025-06-20"),
        remaining: 450,
        paymentMethod: "transfer",
        notes: "Complément de paiement",
      },
    ],
  },
  {
    id: "2",
    _id: "2",
    name: "Fatma Trabelsi",
    phone: "+216 22 654 321",
    available: false,
    totalEvents: 3,
    totalEarnings: 350, // Montant restant
    payments: [
      {
        amount: 100,
        date: new Date("2025-06-10"),
        remaining: 350,
        paymentMethod: "cash",
        notes: "Premier paiement",
      },
    ],
  },
  {
    id: "3",
    _id: "3",
    name: "Mohamed Sassi",
    phone: "+216 25 789 123",
    available: true,
    totalEvents: 7,
    totalEarnings: 800, // Pas encore de paiements
    payments: [],
  },
];

// Routes
app.get("/api/servers", (req, res) => {
  res.json(servers);
});

app.post("/api/servers", (req, res) => {
  const newServer = {
    id: String(servers.length + 1),
    _id: String(servers.length + 1),
    ...req.body,
    totalEvents: 0,
    totalEarnings: 0,
    payments: [],
  };
  servers.push(newServer);
  res.status(201).json(newServer);
});

app.put("/api/servers/:id/toggle-availability", (req, res) => {
  const serverId = req.params.id;
  const server = servers.find((s) => s.id === serverId || s._id === serverId);

  if (!server) {
    return res.status(404).json({ message: "Server not found" });
  }

  server.available = !server.available;
  res.json(server);
});

app.delete("/api/servers/:id", (req, res) => {
  const serverId = req.params.id;
  const serverIndex = servers.findIndex(
    (s) => s.id === serverId || s._id === serverId
  );

  if (serverIndex === -1) {
    return res.status(404).json({ message: "Server not found" });
  }

  servers.splice(serverIndex, 1);
  res.json({ message: "Server deleted successfully" });
});

// Get server details
app.get("/api/servers/:id/details", (req, res) => {
  const serverId = req.params.id;
  const server = servers.find((s) => s.id === serverId || s._id === serverId);

  if (!server) {
    return res.status(404).json({ message: "Server not found" });
  }

  // Enrichir avec des informations supplémentaires pour les détails
  const serverDetails = {
    ...server,
    // Ajouter le prix par événement si pas défini
    pricePerEvent:
      server.pricePerEvent ||
      (server.totalEarnings > 0
        ? Math.round(server.totalEarnings / Math.max(server.totalEvents, 1))
        : 150),
    // Ajouter quelques événements fictifs pour l'exemple
    recentEvents: [
      {
        id: "evt1",
        clientName: "Mariage Bouali",
        date: new Date("2025-06-25"),
        location: "Salle Al Ferdous",
        earnings: 150,
      },
      {
        id: "evt2",
        clientName: "Anniversaire Ben Salem",
        date: new Date("2025-06-20"),
        location: "Villa Yasmin",
        earnings: 120,
      },
    ],
  };

  res.json(serverDetails);
});

// Add payment to server
app.post("/api/servers/:id/payment", (req, res) => {
  const serverId = req.params.id;
  const { amount, paymentMethod, notes } = req.body;

  const server = servers.find((s) => s.id === serverId || s._id === serverId);

  if (!server) {
    return res.status(404).json({ message: "Server not found" });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  // Calculate new remaining amount
  const newRemaining = Math.max(0, server.totalEarnings - amount);

  // Add payment to history
  const payment = {
    amount: amount,
    date: new Date(),
    remaining: newRemaining,
    paymentMethod: paymentMethod || "cash",
    notes: notes || "",
  };

  if (!server.payments) {
    server.payments = [];
  }
  server.payments.push(payment);

  // Update total earnings (deduct paid amount)
  server.totalEarnings = newRemaining;

  res.json({
    message: "Payment added successfully",
    server,
    payment,
  });
});

app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
  console.log(`API accessible at http://localhost:${PORT}/api`);
});
