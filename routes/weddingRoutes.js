const express = require("express");
const router = express.Router();


const {
  createWedding,
  getMyWeddings,
  updateWedding,
  deleteWedding,
  viewWedding,
  uploadGallery,
  deleteGalleryImage,
  getPublicWedding,
  updateTheme,
} = require("../controllers/weddingController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
router.post("/create", protect, createWedding);
router.get("/", protect, getMyWeddings);
router.get("/view/:id", protect, viewWedding);
router.get("/public/:id", getPublicWedding);
router.put("/:id", protect, updateWedding);

router.delete("/:id", protect, deleteWedding);
router.post("/:id/gallery", protect, upload.array("images", 10), uploadGallery);
router.delete("/:id/gallery", protect, deleteGalleryImage);
router.put("/theme/:id", protect, updateTheme);
module.exports = router;
