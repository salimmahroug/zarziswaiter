const express = require("express");
const router = express.Router();
const Server = require("../models/Server");
const Event = require("../models/Event");

// Get all servers with basic info
router.get("/", async (req, res) => {
  try {
    const servers = await Server.find().sort({ createdAt: -1 });
    // Transform _id to id for frontend compatibility
    const transformedServers = servers.map((server) => {
      const serverObj = server.toObject();
      return {
        ...serverObj,
        id: serverObj._id.toString(),
      };
    });
    res.json(transformedServers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all servers with detailed information
router.get("/all-details", async (req, res) => {
  try {
    const servers = await Server.find();
    const detailedServers = await Promise.all(
      servers.map(async (server) => {
        // Récupérer les événements du serveur
        const events = await Event.find({ assignedServers: server._id });

        // Calculer les gains totaux
        const totalEarnings = events.reduce((sum, event) => {
          const serversCount = event.assignedServers.length;
          return sum + event.netAmount / serversCount;
        }, 0);

        // Calculer le prix moyen par événement
        const averagePricePerEvent =
          events.length > 0 ? totalEarnings / events.length : 0;

        return {
          id: server._id,
          name: server.name,
          phone: server.phone,
          totalEvents: events.length,
          totalEarnings: totalEarnings,
          pricePerEvent: averagePricePerEvent,
          available: server.available,
          events: events.map((event) => ({
            id: event._id,
            clientName: event.clientName,
            eventType: event.eventType,
            date: event.date,
            location: event.location,
            earnings: event.netAmount / event.assignedServers.length,
          })),
        };
      })
    );

    res.json(detailedServers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get server statistics
router.get("/stats/:id", async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ message: "Serveur non trouvé" });
    }

    // Récupérer tous les événements où ce serveur est assigné
    const events = await Event.find({ assignedServers: server._id });

    // Calculer les statistiques
    const stats = {
      totalEvents: events.length,
      totalEarnings: events.reduce((sum, event) => {
        const serversCount = event.assignedServers.length;
        return sum + event.netAmount / serversCount;
      }, 0),
    };

    // Mettre à jour les statistiques du serveur
    server.totalEvents = stats.totalEvents;
    server.totalEarnings = stats.totalEarnings;
    await server.save();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get detailed server information
router.get("/:id/details", async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ message: "Serveur non trouvé" });
    }

    // Transform _id to id for frontend compatibility (like in the main route)
    const serverObj = server.toObject();
    const transformedServer = {
      ...serverObj,
      id: serverObj._id.toString(),
    };

    // Récupérer les événements du serveur pour les informations additionnelles
    const events = await Event.find({ assignedServers: server._id });

    // Calculer les gains totaux cumulés (avant paiements) pour information
    const totalEarningsFromEvents = events.reduce((sum, event) => {
      const serversCount = event.assignedServers.length;
      return sum + event.netAmount / serversCount;
    }, 0);

    // Calculer le prix moyen par événement
    const averagePricePerEvent =
      events.length > 0 ? totalEarningsFromEvents / events.length : 0;

    // Calculer le total des paiements déjà effectués
    const payments = server.payments || [];
    const totalPayments = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Ajouter les informations calculées et les événements
    const detailedServer = {
      ...transformedServer,
      // Garder les valeurs telles qu'elles sont dans la base de données
      totalEarningsOriginal: totalEarningsFromEvents, // Total des gains avant paiements
      totalPayments: totalPayments, // Total des paiements effectués
      pricePerEvent: averagePricePerEvent,
      // Ajouter les événements pour la page de détail
      events: events.map((event) => ({
        id: event._id,
        clientName: event.clientName,
        eventType: event.eventType,
        date: event.date,
        location: event.location,
        earnings: event.netAmount / event.assignedServers.length,
      })),
    };

    res.json(detailedServer);
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
      return res.status(404).json({ message: "Serveur non trouvé" });
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

    // Toggle availability
    server.available = !server.available;

    // Save the changes
    const updatedServer = await server.save();

    // Transform response for frontend
    const serverObj = updatedServer.toObject();
    const response = {
      ...serverObj,
      id: serverObj._id.toString(),
    };

    // Return the updated server
    res.json(response);
  } catch (error) {
    console.error("Error toggling server availability:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la disponibilité" });
  }
});

// Add payment to server
router.post("/:id/payment", async (req, res) => {
  try {
    const { amount, paymentMethod, notes } = req.body;

    // Valider le montant
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ message: "Serveur non trouvé" });
    }

    // Vérifier que le serveur a suffisamment de gains à payer
    if (paymentAmount > server.totalEarnings) {
      return res.status(400).json({
        message:
          "Le montant du paiement ne peut pas dépasser le montant restant à payer",
        currentAmount: server.totalEarnings,
      });
    }

    // Calculer le nouveau montant restant
    const newRemaining = Math.max(0, server.totalEarnings - paymentAmount);

    // Ajouter le paiement à l'historique
    const payment = {
      amount: paymentAmount,
      date: new Date(),
      remaining: newRemaining,
      paymentMethod: paymentMethod || "cash",
      notes: notes || "",
    };

    // Initialiser le tableau des paiements s'il n'existe pas
    if (!server.payments) {
      server.payments = [];
    }

    server.payments.push(payment);

    // Mettre à jour le total des gains (déduire le montant payé)
    server.totalEarnings = newRemaining;

    await server.save();

    console.log("Paiement effectué avec succès:", paymentAmount);
    console.log("Nouveau montant restant:", newRemaining);

    // Récupérer les événements du serveur pour les statistiques
    const events = await Event.find({ assignedServers: server._id });
    const totalEarningsFromEvents = events.reduce((sum, event) => {
      const serversCount = event.assignedServers.length;
      return sum + event.netAmount / serversCount;
    }, 0);

    // Calculer le total des paiements effectués
    const totalPayments = server.payments.reduce((sum, p) => sum + p.amount, 0);

    // Formater correctement la réponse pour le frontend
    const serverObj = server.toObject();
    const formattedResponse = {
      message: "Paiement ajouté avec succès",
      server: {
        ...serverObj,
        id: serverObj._id.toString(),
        totalEarningsOriginal: totalEarningsFromEvents,
        totalPayments: totalPayments,
        payments: serverObj.payments.map((p) => ({
          amount: p.amount,
          date: p.date,
          remaining: p.remaining,
          paymentMethod: p.paymentMethod || "cash",
          notes: p.notes || "",
        })),
      },
      payment,
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error("Error adding payment:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout du paiement" });
  }
});

module.exports = router;
