const Wedding = require("../models/Wedding");
const cloudinary = require("../config/cloudinary");

const createWedding = async (req, res) => {
  try {
    const { coupleNames, story, weddingDate, venue } = req.body;

    const wedding = new Wedding({
      owner: req.user.id,
      coupleNames,
      story,
      weddingDate,
      venue,
    });

    await wedding.save();

    res.status(201).json({
      message: "Wedding created successfully",
      wedding,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getMyWeddings = async (req, res) => {
  try {
    const weddings = await Wedding.find({
      owner: req.user.id,
    });

    res.status(200).json({
      weddings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const updateWedding = async (req, res) => {
  try {
    const wedding = await Wedding.findById(req.params.id);

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

    wedding.coupleNames = req.body.coupleNames || wedding.coupleNames;
    wedding.story = req.body.story || wedding.story;
    wedding.weddingDate = req.body.weddingDate || wedding.weddingDate;
    wedding.venue = req.body.venue || wedding.venue;

    await wedding.save();

    res.status(200).json({
      message: "Wedding updated successfully",
      wedding,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const deleteWedding = async (req, res) => {
  try {
    const wedding = await Wedding.findById(req.params.id);

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

    await wedding.deleteOne();

    res.status(200).json({
      message: "Wedding deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const viewWedding = async (req, res) => {
  try {
    const wedding = await Wedding.findById(req.params.id);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

   
    const isOwner = wedding.owner.toString() === req.user.id;

 
    const isGuest =
      req.user.wedding &&
      req.user.wedding.toString() === wedding._id.toString();

    if (!isOwner && !isGuest) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({
      wedding,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const uploadGallery = async (req, res) => {
  try {
    const wedding = await Wedding.findById(req.params.id);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    // Check owner
    if (wedding.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the couple can upload images",
      });
    }

    const imageUrls = [];

    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          folder: "wedding-gallery",
        },
      );

      imageUrls.push(result.secure_url);
    }

    wedding.gallery.push(...imageUrls);

    await wedding.save();

    res.status(200).json({
      message: "Gallery uploaded successfully",
      gallery: wedding.gallery,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const deleteGalleryImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const wedding = await Wedding.findById(req.params.id);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    // Check owner
    if (wedding.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the couple can delete images",
      });
    }

    // Remove from gallery array
    wedding.gallery = wedding.gallery.filter((image) => image !== imageUrl);

    await wedding.save();

    res.status(200).json({
      message: "Image removed successfully",
      gallery: wedding.gallery,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getPublicWedding = async (req, res) => {
  try {
    const wedding = await Wedding.findById(req.params.id);

    if (!wedding) {
      return res.status(404).json({
        message: "Wedding not found",
      });
    }

    res.status(200).json({
      wedding,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  createWedding,
  getMyWeddings,
  updateWedding,
    deleteWedding,
    viewWedding,
  uploadGallery,
  deleteGalleryImage,
  getPublicWedding,
};
