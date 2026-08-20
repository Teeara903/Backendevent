const multer = require("multer");
const express = require("express");
const router = express.Router();

console.log("GUEST ROUTES FILE LOADED");

const {
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
} = require("../controllers/guestController");
const upload = multer({
  storage: multer.memoryStorage(),
});
const { protect } = require("../middleware/authMiddleware");
const { guestProtect } = require("../middleware/guestAuthMiddleware");
// Guest login
router.post("/login", guestLogin);

// Invitation details
// Public route - guest is not logged in yet
router.get("/invitation/:token", getInvitationDetails);

// Accept invitation
// Public route - guest is not logged in yet
router.post("/accept-invite/:token", acceptInvitation);

router.get("/wedding", guestProtect, getGuestWedding);

router.put("/rsvp", guestProtect, updateRSVP);

// Couple adds guest
router.post("/:weddingId", protect, addGuest);
router.post("/bulk/:weddingId", protect, upload.single("file"), bulkAddGuests);
// Guest statistics
router.get("/stats/:weddingId", protect, getGuestStats);
router.post("/:guestId/send-invitation", protect, sendGuestInvitation);
// Get wedding guests
router.get("/:weddingId", protect, getGuests);

module.exports = router;
