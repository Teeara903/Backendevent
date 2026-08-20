const jwt = require("jsonwebtoken");

const guestProtect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Guest authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Guest authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guest tokens must contain both guest ID and wedding ID
    if (!decoded.id || !decoded.wedding) {
      return res.status(401).json({
        message: "Invalid guest token",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.log("GUEST JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid guest token",
    });
  }
};

module.exports = { guestProtect };
