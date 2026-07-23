const dotenv = require("dotenv");
dotenv.config();
const express = require("express");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const weddingRoutes = require("./routes/weddingRoutes");
const guestRoutes = require("./routes/guestRoutes");

connectDB();
const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/weddings", weddingRoutes);
app.use("/api/guests", guestRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Wedding Event Management API");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
