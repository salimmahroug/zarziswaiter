const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Server = require("../models/Server");

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get event statistics
router.get("/stats", async (req, res) => {
  try {
    const events = await Event.find();
    const stats = {
      totalEvents: events.length,
      totalRevenue: events.reduce((sum, event) => sum + event.totalAmount, 0),
      totalCommission: events.reduce(
        (sum, event) => sum + event.companyCommission,
        0
      ),
      totalNetAmount: events.reduce(
        (sum, event) => sum + (event.totalAmount - event.companyCommission),
        0
      ),
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly revenue
router.get("/monthly-revenue", async (req, res) => {
  try {
    const events = await Event.find();
    const monthlyData = {};

    events.forEach((event) => {
      const date = new Date(event.date);
      const monthYear = date.toLocaleString("fr-FR", {
        month: "short",
        year: "2-digit",
      });

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          revenue: 0,
          commission: 0,
        };
      }

      monthlyData[monthYear].revenue += event.totalAmount;
      monthlyData[monthYear].commission += event.companyCommission;
    });

    const formattedData = Object.entries(monthlyData).map(([month, data]) => ({
      name: month,
      revenue: data.revenue,
      commission: data.commission,
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get events by caterer
router.get("/by-caterer/:caterer", async (req, res) => {
  try {
    const { caterer } = req.params;
    const events = await Event.find({ caterer }).sort({ date: -1 });

    // Calculate statistics for this caterer
    const stats = {
      totalEvents: events.length,
      totalRevenue: events.reduce((sum, event) => sum + event.totalAmount, 0),
      totalCatererCost: events.reduce(
        (sum, event) => sum + (event.catererPrice || 0),
        0
      ),
      totalCommission: events.reduce(
        (sum, event) => sum + event.companyCommission,
        0
      ),
    };

    res.json({
      events,
      stats,
      caterer: {
        name: getCatererDisplayName(caterer),
        code: caterer,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to get caterer display name
function getCatererDisplayName(caterer) {
  const names = {
    "chef-souma": "Chef Souma",
    "ayoub-chaftar": "Ayoub Chaftar",
    "prive-sans-traiteur": "Privé sans traiteur",
  };
  return names[caterer] || caterer;
}

// Get single event
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "assignedServers"
    );
    if (!event)
      return res.status(404).json({ message: "Événement non trouvé" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post("/", async (req, res) => {
  const {
    clientName,
    eventType,
    caterer,
    catererPrice,
    date,
    location,
    numberOfServers,
    pricePerServer,
    serverPayAmount,
    totalAmount,
    companyCommission,
    netAmount,
    notes,
    assignedServerIds,
  } = req.body;

  try {
    // Validate assigned servers exist
    if (assignedServerIds && assignedServerIds.length) {
      const serverCount = await Server.countDocuments({
        _id: { $in: assignedServerIds },
      });

      if (serverCount !== assignedServerIds.length) {
        return res.status(400).json({
          message: "Un ou plusieurs serveurs assignés sont invalides",
        });
      }
    }

    const event = new Event({
      clientName,
      eventType,
      caterer,
      catererPrice: catererPrice || 0,
      date: new Date(date),
      location,
      numberOfServers,
      pricePerServer,
      serverPayAmount,
      totalAmount,
      companyCommission,
      netAmount,
      notes,
      assignedServers: assignedServerIds || [],
    });

    const newEvent = await event.save();

    // Update servers' totalEvents and totalEarnings
    if (assignedServerIds && assignedServerIds.length) {
      // Utiliser serverPayAmount pour calculer les gains de chaque serveur
      const earningsPerServer =
        serverPayAmount || netAmount / assignedServerIds.length;

      await Server.updateMany(
        { _id: { $in: assignedServerIds } },
        { $inc: { totalEvents: 1, totalEarnings: earningsPerServer } }
      );
    }

    // Return the event with populated assignedServers
    const populatedEvent = await Event.findById(newEvent._id).populate(
      "assignedServers"
    );
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update event
router.put("/:id", async (req, res) => {
  try {
    const { assignedServerIds, ...eventData } = req.body;

    if (assignedServerIds) {
      eventData.assignedServers = assignedServerIds;
    }

    if (eventData.date) {
      eventData.date = new Date(eventData.date);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true }
    ).populate("assignedServers");

    if (!updatedEvent)
      return res.status(404).json({ message: "Événement non trouvé" });
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Événement non trouvé" });

    // Update servers' totalEvents and totalEarnings
    if (event.assignedServers && event.assignedServers.length) {
      // Utiliser serverPayAmount pour calculer les gains à déduire
      const earningsPerServer =
        event.serverPayAmount || event.netAmount / event.assignedServers.length;

      await Server.updateMany(
        { _id: { $in: event.assignedServers } },
        { $inc: { totalEvents: -1, totalEarnings: -earningsPerServer } }
      );
    }

    await Event.deleteOne({ _id: req.params.id });
    res.json({ message: "Événement supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get events for a specific server
router.get("/server/:serverId", async (req, res) => {
  try {
    const { serverId } = req.params;

    // Find events where the server is assigned
    const events = await Event.find({
      assignedServers: serverId,
    })
      .populate("assignedServers")
      .sort({ date: -1 });

    res.json(events);
  } catch (error) {
    console.error("Error fetching server events:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update server payment status for an event
router.patch("/:eventId/server-payment/:serverId", async (req, res) => {
  try {
    const { eventId, serverId } = req.params;
    const { amountPaid, isPaid, paymentDate, paymentMethod, notes } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    // Find or create server payment entry
    let serverPayment = event.serverPayments?.find(
      (payment) => payment.serverId.toString() === serverId
    );

    if (!serverPayment) {
      // Create new payment entry if doesn't exist
      if (!event.serverPayments) {
        event.serverPayments = [];
      }

      serverPayment = {
        serverId,
        amountDue: event.serverPayAmount || 0,
        amountPaid: 0,
        isPaid: false,
      };

      event.serverPayments.push(serverPayment);
    }

    // Update payment information
    if (amountPaid !== undefined) serverPayment.amountPaid = amountPaid;
    if (isPaid !== undefined) serverPayment.isPaid = isPaid;
    if (paymentDate !== undefined) serverPayment.paymentDate = paymentDate;
    if (paymentMethod !== undefined)
      serverPayment.paymentMethod = paymentMethod;
    if (notes !== undefined) serverPayment.notes = notes;

    await event.save();

    // Update server's payment records
    const server = await Server.findById(serverId);
    if (server && isPaid) {
      const existingPaymentIndex = server.payments.findIndex(
        (payment) => payment.eventId?.toString() === eventId
      );

      const paymentRecord = {
        amount: amountPaid || serverPayment.amountDue,
        date: paymentDate || new Date(),
        remaining:
          server.totalEarnings - (amountPaid || serverPayment.amountDue),
        eventId: eventId,
        paymentMethod: paymentMethod || "cash",
        notes: notes || "",
      };

      if (existingPaymentIndex >= 0) {
        server.payments[existingPaymentIndex] = paymentRecord;
      } else {
        server.payments.push(paymentRecord);
      }

      await server.save();
    }

    const updatedEvent = await Event.findById(eventId).populate(
      "assignedServers"
    );
    res.json(updatedEvent);
  } catch (error) {
    console.error("Error updating server payment:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get payment summary for a server in a specific period
router.get("/server/:serverId/payments", async (req, res) => {
  try {
    const { serverId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { assignedServers: serverId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const events = await Event.find(query)
      .populate("assignedServers")
      .sort({ date: -1 });

    // Calculate payment summary
    const summary = events.reduce(
      (acc, event) => {
        const serverPayment = event.serverPayments?.find(
          (payment) => payment.serverId.toString() === serverId
        );

        const amountDue =
          serverPayment?.amountDue || event.serverPayAmount || 0;
        const amountPaid = serverPayment?.amountPaid || 0;

        acc.totalEvents += 1;
        acc.totalDue += amountDue;
        acc.totalPaid += amountPaid;
        acc.totalPending += amountDue - amountPaid;

        if (serverPayment?.isPaid) {
          acc.paidEvents += 1;
        }

        return acc;
      },
      {
        totalEvents: 0,
        paidEvents: 0,
        totalDue: 0,
        totalPaid: 0,
        totalPending: 0,
      }
    );

    res.json({
      events,
      summary,
    });
  } catch (error) {
    console.error("Error fetching server payment summary:", error);
    res.status(500).json({ message: error.message });
  }
});

// Initialize server payments for existing events
router.post("/initialize-server-payments", async (req, res) => {
  try {
    const events = await Event.find().populate("assignedServers");
    let updatedCount = 0;

    for (const event of events) {
      // Only update if serverPayments doesn't exist or is empty
      if (!event.serverPayments || event.serverPayments.length === 0) {
        event.serverPayments = event.assignedServers.map((server) => ({
          serverId: server._id,
          amountDue: event.serverPayAmount || 0,
          amountPaid: 0,
          isPaid: false,
        }));

        await event.save();
        updatedCount++;
      }
    }

    res.json({
      message: `${updatedCount} événements mis à jour avec les informations de paiement`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error initializing server payments:", error);
    res.status(500).json({ message: error.message });
  }
});

// Reset all revenue and commissions to zero
router.post("/reset-revenue", async (req, res) => {
  try {
    // Reset all events' financial data
    const updateResult = await Event.updateMany(
      {},
      {
        $set: {
          totalAmount: 0,
          companyCommission: 0,
          netAmount: 0,
          serverPayAmount: 0,
        },
      }
    );

    // Reset all servers' earnings
    const serverUpdateResult = await Server.updateMany(
      {},
      {
        $set: {
          totalEarnings: 0,
          totalEvents: 0,
          payments: [],
        },
      }
    );

    res.json({
      message: "Revenus et commissions réinitialisés avec succès",
      eventsUpdated: updateResult.modifiedCount,
      serversUpdated: serverUpdateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error resetting revenue and commissions:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
