import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");
const PHOTOS_FILE = path.join(DATA_DIR, "photos.json");
const WISHES_FILE = path.join(DATA_DIR, "wishes.json");

// Ensure data directory and files exist with defaults
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_STATE = {
  isLocked: false,
  userInputAccessEnabled: true,
  celebrantName: "Disha",
  msgLines: {
    line1: "May this year bring endless happiness, beautiful memories, success, laughter, and everything that makes you smile.",
    line2: "You deserve all the joy in the world.",
    line3: "Happy Birthday, Disha"
  },
  authPassword: "disha2026",
  approvedPhotoIds: []
};

if (!fs.existsSync(STATE_FILE)) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
}
if (!fs.existsSync(PHOTOS_FILE)) {
  fs.writeFileSync(PHOTOS_FILE, "[]");
}
if (!fs.existsSync(WISHES_FILE)) {
  fs.writeFileSync(WISHES_FILE, "[]");
}

async function startServer() {
  const app = express();

  // Allow large payloads for base64 photo transfers
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // --- API Routes ---

  // 1. Get entire state (settings and messages)
  app.get("/api/state", (req, res) => {
    try {
      const data = fs.readFileSync(STATE_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      console.error("Error reading state:", err);
      res.status(500).json({ error: "Failed to read system state" });
    }
  });

  // 2. Update state (partial updates allowed)
  app.post("/api/state", (req, res) => {
    try {
      const currentData = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
      const updatedData = { ...currentData, ...req.body };
      fs.writeFileSync(STATE_FILE, JSON.stringify(updatedData, null, 2));
      res.json(updatedData);
    } catch (err) {
      console.error("Error updating state:", err);
      res.status(500).json({ error: "Failed to update system state" });
    }
  });

  // 3. Get all uploaded photos
  app.get("/api/photos", (req, res) => {
    try {
      const data = fs.readFileSync(PHOTOS_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      console.error("Error reading photos:", err);
      res.status(500).json({ error: "Failed to read uploaded photos" });
    }
  });

  // 4. Add a new photo
  app.post("/api/photos", (req, res) => {
    try {
      const { id, name, dataUrl, timestamp } = req.body;
      if (!id || !dataUrl) {
        return res.status(400).json({ error: "Missing required photo fields" });
      }
      const pData = JSON.parse(fs.readFileSync(PHOTOS_FILE, "utf-8"));
      
      // Prevent duplicates
      const filtered = pData.filter((p: any) => p.id !== id);
      filtered.push({ id, name, dataUrl, timestamp: timestamp || Date.now() });
      
      fs.writeFileSync(PHOTOS_FILE, JSON.stringify(filtered, null, 2));
      res.json({ success: true, count: filtered.length });
    } catch (err) {
      console.error("Error adding photo:", err);
      res.status(500).json({ error: "Failed to save photo" });
    }
  });

  // 5. Delete specific photo
  app.delete("/api/photos/:id", (req, res) => {
    try {
      const { id } = req.params;
      const pData = JSON.parse(fs.readFileSync(PHOTOS_FILE, "utf-8"));
      const filtered = pData.filter((p: any) => p.id !== id);
      fs.writeFileSync(PHOTOS_FILE, JSON.stringify(filtered, null, 2));
      
      // Also remove from approved list in state if present
      const stateData = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
      if (stateData.approvedPhotoIds && Array.isArray(stateData.approvedPhotoIds)) {
        stateData.approvedPhotoIds = stateData.approvedPhotoIds.filter((pId: string) => pId !== id);
        fs.writeFileSync(STATE_FILE, JSON.stringify(stateData, null, 2));
      }

      res.json({ success: true, deleted: id });
    } catch (err) {
      console.error("Error deleting photo:", err);
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });

  // 6. Clear all photos and reset approvals
  app.post("/api/photos/clear", (req, res) => {
    try {
      fs.writeFileSync(PHOTOS_FILE, "[]");
      
      const stateData = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
      stateData.approvedPhotoIds = [];
      fs.writeFileSync(STATE_FILE, JSON.stringify(stateData, null, 2));

      res.json({ success: true });
    } catch (err) {
      console.error("Error clearing photos:", err);
      res.status(500).json({ error: "Failed to clear photos" });
    }
  });

  // 7. Get guest book wishes
  app.get("/api/wishes", (req, res) => {
    try {
      const data = fs.readFileSync(WISHES_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      console.error("Error reading wishes:", err);
      res.status(500).json({ error: "Failed to load guest registry wishes" });
    }
  });

  // 8. Add a wish to guest book
  app.post("/api/wishes", (req, res) => {
    try {
      const { id, name, message, timestamp } = req.body;
      if (!name || !message) {
        return res.status(400).json({ error: "Missing required wish fields" });
      }
      const wData = JSON.parse(fs.readFileSync(WISHES_FILE, "utf-8"));
      const newWish = {
        id: id || Math.random().toString(36).substring(2, 9),
        name,
        message,
        timestamp: timestamp || Date.now()
      };
      wData.unshift(newWish); // Newer wishes first
      fs.writeFileSync(WISHES_FILE, JSON.stringify(wData, null, 2));
      res.json(newWish);
    } catch (err) {
      console.error("Error adding wish:", err);
      res.status(500).json({ error: "Failed to post wish to guest book" });
    }
  });

  // 9. Clear wishes list
  app.post("/api/wishes/clear", (req, res) => {
    try {
      fs.writeFileSync(WISHES_FILE, "[]");
      res.json({ success: true });
    } catch (err) {
      console.error("Error clearing wishes:", err);
      res.status(500).json({ error: "Failed to clear wishes log" });
    }
  });

  // --- Static Asset Serving & Dev Server Setup ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
