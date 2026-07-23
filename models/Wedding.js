const mongoose = require("mongoose");

const weddingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coupleNames: {
      type: String,
      required: true,
    },

    story: {
      type: String,
    },

    weddingDate: {
      type: Date,
      required: true,
    },

    venue: {
      type: String,
      required: true,
    },

    gallery: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Wedding", weddingSchema);
