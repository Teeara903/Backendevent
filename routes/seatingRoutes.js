const express = require("express");

const router = express.Router();

const {
  createTable,
  getTables,
  assignGuest,
  removeGuest,
  deleteTable,
} = require("../controllers/seatingController");

const { protect } = require("../middleware/authMiddleware");

// Create a table
router.post("/:weddingId", protect, createTable);

// Get all tables for a wedding
router.get("/:weddingId", protect, getTables);

// Assign a guest to a table
router.post("/:tableId/assign", protect, assignGuest);

// Remove a guest from a table
router.delete("/:tableId/guest/:guestId", protect, removeGuest);

// Delete a table
router.delete("/:tableId", protect, deleteTable);

module.exports = router;
