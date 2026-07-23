const Guest = require("../models/Guest");
const Wedding = require("../models/Wedding");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const addGuest = async (req, res) => {
  try {
    const { name, email } = req.body;

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
const invitationToken = crypto.randomBytes(32).toString("hex");

const invitationTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const guest = new Guest({
      name,
      email,
      wedding: wedding._id,
      invitationToken,
      invitationTokenExpires,
    });

    await guest.save();

    res.status(201).json({
      message: "Guest added successfully",
      guest,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getGuests = async (req, res) => {
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

    const guests = await Guest.find({
      wedding: wedding._id,
    });

    res.status(200).json({
      guests,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const acceptInvitation = async (req, res) => {
  try {
    const { password } = req.body;

    const guest = await Guest.findOne({
      invitationToken: req.params.token,
    });

    if (!guest) {
      return res.status(404).json({
        message: "Invalid invitation",
      });
    }

    if (guest.invitationTokenExpires < Date.now()) {
      return res.status(400).json({
        message: "Invitation expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    guest.password = hashedPassword;
    guest.registered = true;

    guest.invitationToken = undefined;
    guest.invitationTokenExpires = undefined;

    await guest.save();

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const guestLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const guest = await Guest.findOne({ email });

    if (!guest) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!guest.registered) {
      return res.status(400).json({
        message: "Please accept your invitation first",
      });
    }

    const isMatch = await bcrypt.compare(password, guest.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: guest._id,
        wedding: guest.wedding,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      message: "Guest login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const updateRSVP = async (req, res) => {
  try {
    const { status } = req.body;

    const guest = await Guest.findById(req.user.id);

    if (!guest) {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    guest.status = status;

    await guest.save();

    res.status(200).json({
      message: "RSVP updated successfully",
      guest,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getGuestStats = async (req, res) => {
  try {
    const guests = await Guest.find({
      wedding: req.params.weddingId,
    });

    const totalGuests = guests.length;

    const attending = guests.filter(
      (guest) => guest.status === "attending",
    ).length;

    const pending = guests.filter((guest) => guest.status === "pending").length;

    const declined = guests.filter(
      (guest) => guest.status === "declined",
    ).length;

    res.status(200).json({
      totalGuests,
      attending,
      pending,
      declined,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addGuest,
    getGuests,
    acceptInvitation,
    guestLogin,
    updateRSVP,
  getGuestStats,
};
