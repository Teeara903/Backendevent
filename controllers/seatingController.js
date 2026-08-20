const Seating = require("../models/Seating");
const Wedding = require("../models/Wedding");
const Guest = require("../models/Guest");

// =========================
// CREATE TABLE
// =========================
const createTable = async (req, res) => {
  try {
    const { tableName, capacity } = req.body;

    const wedding = await Wedding.findById(req.params.weddingId);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    // Make sure the logged-in user owns the wedding
    if (wedding.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (!tableName || !capacity) {
      return res.status(400).json({
        message: "Table name and capacity are required",
      });
    }

    const table = await Seating.create({
      wedding: wedding._id,
      tableName,
      capacity,
      guests: [],
    });

    res.status(201).json({
      message: "Table created successfully",
      table,
    });
  } catch (error) {
    console.log("CREATE TABLE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// GET TABLES
// =========================
const getTables = async (req, res) => {
  try {
    const wedding = await Wedding.findById(req.params.weddingId);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    if (wedding.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const tables = await Seating.find({
      wedding: wedding._id,
    }).populate("guests", "name email status");

    res.status(200).json({
      tables,
    });
  } catch (error) {
    console.log("GET TABLES ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// ASSIGN GUEST TO TABLE
// =========================
const assignGuest = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { guestId } = req.body;

    const table = await Seating.findById(tableId);

    if (!table) {
      return res.status(404).json({
        message: "Table not found",
      });
    }

    const wedding = await Wedding.findById(table.wedding);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    if (wedding.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const guest = await Guest.findById(guestId);

    if (!guest) {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    // Make sure guest belongs to this wedding
    if (guest.wedding.toString() !== wedding._id.toString()) {
      return res.status(400).json({
        message: "Guest does not belong to this wedding",
      });
    }

    // Check table capacity
    if (table.guests.length >= table.capacity) {
      return res.status(400).json({
        message: "Table is full",
      });
    }

    // Check if guest is already assigned to this table
    if (table.guests.some((id) => id.toString() === guestId)) {
      return res.status(400).json({
        message: "Guest is already assigned to this table",
      });
    }

    // Check if guest is already assigned to another table
    const existingTable = await Seating.findOne({
      wedding: wedding._id,
      guests: guestId,
    });

    if (existingTable) {
      return res.status(400).json({
        message: "Guest is already assigned to another table",
      });
    }

    table.guests.push(guestId);

    await table.save();

    const updatedTable = await Seating.findById(table._id).populate(
      "guests",
      "name email status",
    );

    res.status(200).json({
      message: "Guest assigned successfully",
      table: updatedTable,
    });
  } catch (error) {
    console.log("ASSIGN GUEST ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// REMOVE GUEST FROM TABLE
// =========================
const removeGuest = async (req, res) => {
  try {
    const { tableId, guestId } = req.params;

    const table = await Seating.findById(tableId);

    if (!table) {
      return res.status(404).json({
        message: "Table not found",
      });
    }

    const wedding = await Wedding.findById(table.wedding);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    if (wedding.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    table.guests = table.guests.filter((id) => id.toString() !== guestId);

    await table.save();

    const updatedTable = await Seating.findById(table._id).populate(
      "guests",
      "name email status",
    );

    res.status(200).json({
      message: "Guest removed from table",
      table: updatedTable,
    });
  } catch (error) {
    console.log("REMOVE GUEST ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// DELETE TABLE
// =========================
const deleteTable = async (req, res) => {
  try {
    const table = await Seating.findById(req.params.tableId);

    if (!table) {
      return res.status(404).json({
        message: "Table not found",
      });
    }

    const wedding = await Wedding.findById(table.wedding);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    if (wedding.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await Seating.findByIdAndDelete(table._id);

    res.status(200).json({
      message: "Table deleted successfully",
    });
  } catch (error) {
    console.log("DELETE TABLE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTable,
  getTables,
  assignGuest,
  removeGuest,
  deleteTable,
};
