const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Spotify Clone Backend is running");
});


// 🔍 SEARCH SONGS & ARTISTS (iTunes API)
app.get("/api/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=20`
    );

    const data = await response.json();

    // Clean response (only useful fields)
    const results = data.results.map(song => ({
      id: song.trackId,
      title: song.trackName,
      artist: song.artistName,
      album: song.collectionName,
      artwork: song.artworkUrl100,
      preview: song.previewUrl
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

const fs = require("fs");
const path = require("path");

const favFile = path.join(__dirname, "favorites.json");

// Get favorites
app.get("/api/favorites", (req, res) => {
  const data = JSON.parse(fs.readFileSync(favFile, "utf-8"));
  res.json(data);
});

// Add favorite
app.post("/api/favorites", (req, res) => {
  const song = req.body;

  const data = JSON.parse(fs.readFileSync(favFile, "utf-8"));

  data.push(song);

  fs.writeFileSync(favFile, JSON.stringify(data, null, 2));
  res.json({ success: true });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
