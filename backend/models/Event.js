const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true,
  },
  eventType: {
    type: String,
    required: true,
    enum: ["marriage", "fiancaille", "anniversaire", "autre"],
  },
  caterer: {
    type: String,
    required: true,
    enum: ["chef-souma", "ayoub-chaftar", "prive-sans-traiteur"],
  },
  catererPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  numberOfServers: {
    type: Number,
    required: true,
    min: 1,
  },
  pricePerServer: {
    type: Number,
    required: true,
    min: 0,
  },
  serverPayAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  companyCommission: {
    type: Number,
    required: true,
    min: 0,
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  assignedServers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
    },
  ],
  serverPayments: [
    {
      serverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Server",
        required: true,
      },
      amountDue: {
        type: Number,
        required: true,
        min: 0,
      },
      amountPaid: {
        type: Number,
        default: 0,
        min: 0,
      },
      isPaid: {
        type: Boolean,
        default: false,
      },
      paymentDate: {
        type: Date,
      },
      paymentMethod: {
        type: String,
        enum: ["cash", "transfer", "check", "other"],
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

// Populate assignedServers when finding events
eventSchema.pre("find", function (next) {
  this.populate("assignedServers");
  next();
});

eventSchema.pre("findOne", function (next) {
  this.populate("assignedServers");
  next();
});

module.exports = mongoose.model("Event", eventSchema);
