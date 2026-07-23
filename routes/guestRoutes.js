const express = require("express");
const router = express.Router();

const { addGuest, getGuests, acceptInvitation, guestLogin,updateRSVP, getGuestStats } = require("../controllers/guestController");

const { protect } = require("../middleware/authMiddleware");
router.post("/login", guestLogin);
router.post("/accept-invite/:token", acceptInvitation);
router.put("/rsvp", protect, updateRSVP);
router.post("/:weddingId", protect, addGuest);
router.get("/:weddingId", protect, getGuests);
router.get("/stats/:weddingId", protect, getGuestStats);

module.exports = router;
