const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  description: {
    type: String,
  },
  available: {
    type: Boolean,
    default: true,
  },
  totalEvents: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  pricePerEvent: {
    type: Number,
    default: 0, // Prix sera défini lors de la création d'événement
  },
  payments: [
    {
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      remaining: {
        type: Number,
        required: true,
      },
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
      paymentMethod: {
        type: String,
        enum: ["cash", "transfer", "check", "other"],
        default: "cash",
      },
      notes: {
        type: String,
        trim: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Server", serverSchema);
