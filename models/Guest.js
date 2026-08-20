const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
  type: String,
  required: true,
  lowercase: true,
  trim: true,
},
    password: {
      type: String,
    },

    status: {
      type: String,
      default: "pending",
    },

    wedding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wedding",
      required: true,
    },

    invitationToken: {
      type: String,
    },

    invitationTokenExpires: {
      type: Date,
    },

    registered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
guestSchema.index({ email: 1, wedding: 1 }, { unique: true });
module.exports = mongoose.model("Guest", guestSchema);
