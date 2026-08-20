const dotenv = require("dotenv");
dotenv.config();
console.log(
  "MONGO URI HOST:",
  process.env.MONGO_URI?.split("@")[1]?.split("/")[0],
);
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const weddingRoutes = require("./routes/weddingRoutes");
const guestRoutes = require("./routes/guestRoutes");
const seatingRoutes = require("./routes/seatingRoutes");

connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/weddings", weddingRoutes);
app.use("/api/seating", seatingRoutes);

console.log("Loading guest routes...");
app.get("/", (req, res) => {
  res.send("Welcome to Wedding Event Management API");
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
