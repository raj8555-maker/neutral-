const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Serve frontend
app.use(express.static("public"));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully ✅"))
  .catch(err => console.log("MongoDB connection error ❌", err));

// ✅ Schema
const User = mongoose.model("User", {
  name: String,
  email: String
});

// ✅ API routes
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post("/save", async (req, res) => {
  await User.create(req.body);
  res.json({ message: "Data saved permanently 🎉" });
});

// ✅ Root route → frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});


