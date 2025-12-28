const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const JWT_SECRET = "secret123"; // for demo only

// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("MongoDB error ❌", err));

// ================= MODELS =================
const User = mongoose.model("User", {
  name: String,
  email: { type: String, unique: true },
  password: String
});

const Post = mongoose.model("Post", {
  caption: String,
  image: String,
  likes: { type: Number, default: 0 },
  comments: [{ text: String }],
  createdAt: { type: Date, default: Date.now }
});

// ================= AUTH MIDDLEWARE =================
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// REGISTER
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  if (await User.findOne({ email }))
    return res.status(409).json({ error: "Email exists" });

  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hash });

  res.json({ message: "Registered successfully 🎉" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET);
  res.json({ token });
});

// CREATE POST
app.post("/post", auth, async (req, res) => {
  const { caption, image } = req.body;
  if (!caption) return res.status(400).json({ error: "Caption required" });

  await Post.create({ caption, image });
  res.json({ message: "Post created ✅" });
});

// FEED
app.get("/feed", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// LIKE
app.post("/like/:id", async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
  res.json({ message: "Liked ❤️" });
});

// COMMENT
app.post("/comment/:id", async (req, res) => {
  const { text } = req.body;
  await Post.findByIdAndUpdate(req.params.id, {
    $push: { comments: { text } }
  });
  res.json({ message: "Comment added 💬" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
