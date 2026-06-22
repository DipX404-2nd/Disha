var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var PORT = 3e3;
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var STATE_FILE = import_path.default.join(DATA_DIR, "state.json");
var PHOTOS_FILE = import_path.default.join(DATA_DIR, "photos.json");
var WISHES_FILE = import_path.default.join(DATA_DIR, "wishes.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var DEFAULT_STATE = {
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
if (!import_fs.default.existsSync(STATE_FILE)) {
  import_fs.default.writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
}
if (!import_fs.default.existsSync(PHOTOS_FILE)) {
  import_fs.default.writeFileSync(PHOTOS_FILE, "[]");
}
if (!import_fs.default.existsSync(WISHES_FILE)) {
  import_fs.default.writeFileSync(WISHES_FILE, "[]");
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "15mb" }));
  app.use(import_express.default.urlencoded({ limit: "15mb", extended: true }));
  app.get("/api/state", (req, res) => {
    try {
      const data = import_fs.default.readFileSync(STATE_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      console.error("Error reading state:", err);
      res.status(500).json({ error: "Failed to read system state" });
    }
  });
  app.post("/api/state", (req, res) => {
    try {
      const currentData = JSON.parse(import_fs.default.readFileSync(STATE_FILE, "utf-8"));
      const updatedData = { ...currentData, ...req.body };
      import_fs.default.writeFileSync(STATE_FILE, JSON.stringify(updatedData, null, 2));
      res.json(updatedData);
    } catch (err) {
      console.error("Error updating state:", err);
      res.status(500).json({ error: "Failed to update system state" });
    }
  });
  app.get("/api/photos", (req, res) => {
    try {
      const data = import_fs.default.readFileSync(PHOTOS_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      console.error("Error reading photos:", err);
      res.status(500).json({ error: "Failed to read uploaded photos" });
    }
  });
  app.post("/api/photos", (req, res) => {
    try {
      const { id, name, dataUrl, timestamp } = req.body;
      if (!id || !dataUrl) {
        return res.status(400).json({ error: "Missing required photo fields" });
      }
      const pData = JSON.parse(import_fs.default.readFileSync(PHOTOS_FILE, "utf-8"));
      const filtered = pData.filter((p) => p.id !== id);
      filtered.push({ id, name, dataUrl, timestamp: timestamp || Date.now() });
      import_fs.default.writeFileSync(PHOTOS_FILE, JSON.stringify(filtered, null, 2));
      res.json({ success: true, count: filtered.length });
    } catch (err) {
      console.error("Error adding photo:", err);
      res.status(500).json({ error: "Failed to save photo" });
    }
  });
  app.delete("/api/photos/:id", (req, res) => {
    try {
      const { id } = req.params;
      const pData = JSON.parse(import_fs.default.readFileSync(PHOTOS_FILE, "utf-8"));
      const filtered = pData.filter((p) => p.id !== id);
      import_fs.default.writeFileSync(PHOTOS_FILE, JSON.stringify(filtered, null, 2));
      const stateData = JSON.parse(import_fs.default.readFileSync(STATE_FILE, "utf-8"));
      if (stateData.approvedPhotoIds && Array.isArray(stateData.approvedPhotoIds)) {
        stateData.approvedPhotoIds = stateData.approvedPhotoIds.filter((pId) => pId !== id);
        import_fs.default.writeFileSync(STATE_FILE, JSON.stringify(stateData, null, 2));
      }
      res.json({ success: true, deleted: id });
    } catch (err) {
      console.error("Error deleting photo:", err);
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });
  app.post("/api/photos/clear", (req, res) => {
    try {
      import_fs.default.writeFileSync(PHOTOS_FILE, "[]");
      const stateData = JSON.parse(import_fs.default.readFileSync(STATE_FILE, "utf-8"));
      stateData.approvedPhotoIds = [];
      import_fs.default.writeFileSync(STATE_FILE, JSON.stringify(stateData, null, 2));
      res.json({ success: true });
    } catch (err) {
      console.error("Error clearing photos:", err);
      res.status(500).json({ error: "Failed to clear photos" });
    }
  });
  app.get("/api/wishes", (req, res) => {
    try {
      const data = import_fs.default.readFileSync(WISHES_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      console.error("Error reading wishes:", err);
      res.status(500).json({ error: "Failed to load guest registry wishes" });
    }
  });
  app.post("/api/wishes", (req, res) => {
    try {
      const { id, name, message, timestamp } = req.body;
      if (!name || !message) {
        return res.status(400).json({ error: "Missing required wish fields" });
      }
      const wData = JSON.parse(import_fs.default.readFileSync(WISHES_FILE, "utf-8"));
      const newWish = {
        id: id || Math.random().toString(36).substring(2, 9),
        name,
        message,
        timestamp: timestamp || Date.now()
      };
      wData.unshift(newWish);
      import_fs.default.writeFileSync(WISHES_FILE, JSON.stringify(wData, null, 2));
      res.json(newWish);
    } catch (err) {
      console.error("Error adding wish:", err);
      res.status(500).json({ error: "Failed to post wish to guest book" });
    }
  });
  app.post("/api/wishes/clear", (req, res) => {
    try {
      import_fs.default.writeFileSync(WISHES_FILE, "[]");
      res.json({ success: true });
    } catch (err) {
      console.error("Error clearing wishes:", err);
      res.status(500).json({ error: "Failed to clear wishes log" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
