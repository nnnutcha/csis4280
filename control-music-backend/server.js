import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb+srv://nsirichaiporn:1234@fullstackwebdevelopment.lwdut.mongodb.net/control-musicDB")
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log("control-musicDB is running on port " + port);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const playlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  playlistName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Playlist = mongoose.model("Playlist", playlistSchema);

const playlistSongSchema = new mongoose.Schema({
  playlistId: { type: String, required: true },
  playlistName: { type: String, required: true },
  userId: { type: String, required: true },
  song: { type: Object, required: true },
  addedAt: { type: Date, default: Date.now },
});
const PlaylistSong = mongoose.model("PlaylistSong", playlistSongSchema);

const router = express.Router();
app.use("/api/playlist", router);

router.post("/create", async (req, res) => {
  const { userId, playlistName } = req.body; 
  console.log("BODY:", req.body); 

  if (!userId || !playlistName) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const playlist = await Playlist.create({ userId, playlistName });
  res.json(playlist);
});

router.get("/list/:userId", async (req, res) => {
  const playlists = await Playlist.find({ userId: req.params.userId });
  res.json(playlists);
});

router.post("/addSong", async (req, res) => {
  try {
    const { userId, playlistName, song } = req.body;
    console.log("REQ BODY:", req.body);
    if (!userId || !playlistName || !song) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const playlist = await Playlist.findOne({ userId, playlistName });
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const added = await PlaylistSong.create({
      playlistId: playlist._id,
      playlistName: playlistName,
      userId: userId,    
      song: song
    });

    res.json({
      success: true,
      playlistId: playlist._id,
      added
    });

  } catch (err) {
    console.error("addSong ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get songs
router.get("/songs/:playlistId", async (req, res) => {
  const songs = await PlaylistSong.find({ playlistId: req.params.playlistId });
  res.json(songs);
});

router.delete("/delete", async (req, res) => {
  try {
    const { playlistId } = req.body;

    if (!playlistId) {
      return res.status(400).json({ success: false, error: "playlistId required" });
    }

    // Delete playlist
    const playlistDelete = await Playlist.deleteOne({ _id: playlistId });

    // Delete songs inside playlist
    await PlaylistSong.deleteMany({ playlistId });

    if (!playlistDelete.deletedCount) {
      return res.json({ success: false, error: "Playlist not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE PLAYLIST ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Delete playlist
router.delete("/delete/:playlistId", async (req, res) => {
  await Playlist.deleteOne({ _id: req.params.playlistId });
  await PlaylistSong.deleteMany({ playlistId: req.params.playlistId });
  res.json({ success: true });
});

// Delete song
router.delete("/song/:id", async (req, res) => {
  await PlaylistSong.deleteOne({ _id: req.params.id });
  res.json({ success: true });
});
