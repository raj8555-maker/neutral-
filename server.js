 const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
// 🔗 MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected successfully ✅"))
.catch(err => console.log("MongoDB connection error ❌", err));

// 📦 Schema
const User = mongoose.model("User", {
  name: String,
  email: String
// Root route
app.get("/", (req, res) => {
  res.send("API is running safely ✅");
});
// 📥 Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
app.post("/save", async (req, res) => {
  await User.create(req.body);
  res.json({ message: "Data saved permanently 🎉" });
});
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});


