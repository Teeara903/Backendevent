const Guest = require("../models/Guest");
const Wedding = require("../models/Wedding");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const csv = require("csv-parser");
const { sendInvitationEmail } = require("../services/emailService");
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
const bulkAddGuests = async (req, res) => {
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

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a CSV file",
      });
    }

    const guests = [];
    const errors = [];

    const processRow = (row, index) => {
      const name = row.name?.trim();
      const email = row.email?.trim().toLowerCase();

      if (!name || !email) {
        errors.push({
          row: index + 1,
          message: "Name and email are required",
        });

        return;
      }

      const invitationToken = crypto.randomBytes(32).toString("hex");

      const invitationTokenExpires =
        Date.now() + 7 * 24 * 60 * 60 * 1000;

      guests.push({
        name,
        email,
        wedding: wedding._id,
        invitationToken,
        invitationTokenExpires,
      });
    };

    await new Promise((resolve, reject) => {
      const stream = require("stream");

      const readable = new stream.Readable();

      readable.push(req.file.buffer);
      readable.push(null);

      let rowIndex = 1;

      readable
        .pipe(csv())
        // .on("data", (row) => {
        //   processRow(row, rowIndex);
        //   rowIndex++;
        // })
        .on("data", (row) => {
  console.log("🔥 CSV ROW:", JSON.stringify(row));

  processRow(row, rowIndex);
  rowIndex++;
})
        .on("end", resolve)
        .on("error", reject);
    });

    if (!guests.length) {
      return res.status(400).json({
        message: "No valid guests found in CSV",
        errors,
      });
    }

    const createdGuests = [];
    const skippedGuests = [];

    for (const guestData of guests) {
      try {
        const existingGuest = await Guest.findOne({
          email: guestData.email,
          wedding: wedding._id,
        });

        if (existingGuest) {
          skippedGuests.push({
            name: guestData.name,
            email: guestData.email,
            reason: "Guest already exists",
          });

          continue;
        }

        const guest = await Guest.create(guestData);

        createdGuests.push(guest);
      } catch (error) {
        skippedGuests.push({
          name: guestData.name,
          email: guestData.email,
          reason: error.message,
        });
      }
    }

    res.status(201).json({
      message: "Guests uploaded successfully",
      created: createdGuests.length,
      skipped: skippedGuests.length,
      invalidRows: errors.length,
      guests: createdGuests,
      skippedGuests,
      errors,
    });
  } catch (error) {
    console.log("BULK ADD GUESTS ERROR:", error);

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
const getInvitationDetails = async (req, res) => {
  try {
    const guest = await Guest.findOne({
      invitationToken: req.params.token,
    });

    if (!guest) {
      return res.status(404).json({
        message: "Invalid or expired invitation",
      });
    }

    // Check invitation expiration
    if (
      guest.invitationTokenExpires &&
      guest.invitationTokenExpires < Date.now()
    ) {
      return res.status(400).json({
        message: "This invitation has expired",
      });
    }

    const wedding = await Wedding.findById(guest.wedding);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    res.status(200).json({
      guestName: guest.name,
      wedding: {
        _id: wedding._id,
        coupleNames: wedding.coupleNames,
        theme: wedding.theme,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const acceptInvitation = async (req, res) => {
  console.log("🔥 ACCEPT CONTROLLER HIT");

  try {
    const { password } = req.body;

    console.log("TOKEN:", req.params.token);

    const guest = await Guest.findOne({
      invitationToken: req.params.token,
    });

    console.log("GUEST FOUND:", guest);

    if (!guest) {
      return res.status(404).json({
        message: "Invalid invitation",
      });
    }

    if (
      guest.invitationTokenExpires &&
      guest.invitationTokenExpires < Date.now()
    ) {
      return res.status(400).json({
        message: "This invitation has expired",
      });
    }

    guest.password = await bcrypt.hash(password, 10);
    guest.registered = true;
    guest.invitationToken = undefined;
    guest.invitationTokenExpires = undefined;

    await guest.save();

    res.json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.log("ACCEPT INVITATION ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const guestLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const guests = await Guest.find({
      email: email.toLowerCase().trim(),
      registered: true,
    });

    if (!guests.length) {
      return res.status(400).json({
        message: "Please accept your invitation first",
      });
    }

    let guest = null;

    // Check the password against the registered guests
    for (const currentGuest of guests) {
      if (
        currentGuest.password &&
        (await bcrypt.compare(password, currentGuest.password))
      ) {
        guest = currentGuest;
        break;
      }
    }

    if (!guest) {
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

    console.log("GUEST LOGIN SUCCESS:", {
      guestId: guest._id,
      weddingId: guest.wedding,
    });

    const wedding = await Wedding.findById(guest.wedding);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    res.status(200).json({
      message: "Guest login successful",
      token,
      wedding,
    });
  } catch (error) {
    console.log("GUEST LOGIN ERROR:", error );

    res.status(500).json({
      message: error.message,
    });
  }
};
const updateRSVP = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["attending", "declined"].includes(status)) {
      return res.status(400).json({
        message: "Invalid RSVP status",
      });
    }

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
    console.log("UPDATE RSVP ERROR:", error);

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
const getGuestWedding = async (req, res) => {
  try {
    const guest = await Guest.findById(req.user.id);

    if (!guest) {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    const wedding = await Wedding.findById(guest.wedding);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    res.status(200).json({
      wedding,
    });
  } catch (error) {
    console.log("GET GUEST WEDDING ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};const sendGuestInvitation = async (req, res) => {
  try {
    const { guestId } = req.params;

    // Find guest
    const guest = await Guest.findById(guestId);

    if (!guest) {
      return res.status(404).json({
        message: "Guest not found",
      });
    }

    // Find wedding
    const wedding = await Wedding.findById(guest.wedding);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    // Make sure the logged-in user owns this wedding
    if (wedding.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // Make sure the guest has an invitation token
    if (!guest.invitationToken) {
      return res.status(400).json({
        message: "This guest does not have an invitation token",
      });
    }

    // Create invitation link
    const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation/${guest.invitationToken}`;

    // Send email
    await sendInvitationEmail({
      guestName: guest.name,
      guestEmail: guest.email,
      coupleNames: wedding.coupleNames,
      invitationLink,
    });

    res.status(200).json({
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.log("SEND INVITATION ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  addGuest,
  bulkAddGuests,
  getGuests,
  getInvitationDetails,
  acceptInvitation,
  guestLogin,
  updateRSVP,
  getGuestStats,
  getGuestWedding,
  sendGuestInvitation,
};
