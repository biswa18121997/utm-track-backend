import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import createCampaign from "./controllers/NewCampaign.js";
import { decode } from "./utils/CodeExaminer.js"; // reversible decode
import { LinkCampaignUtm, Click } from "./schema_models/UtmSchema.js";

dotenv.config();
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://flashfire-frontend-hoisted.vercel.app",
  "https://flashfirejobs.com",
  "https://www.flashfirejobs.com",
  "https://flashfire-frontend-hoisted.vercel.app/"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors()); // <-- preflight support


app.use(express.json());

const PORT = process.env.PORT || process.env.Port || 5000;
const MONGO_URI = process.env.MONGO_DB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campaign-tracker";
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// ---- DB connect ----
mongoose.connect(MONGO_URI).then(() => {
  console.log("✅ MongoDB connected");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

// ---- Helpers ----
function getClientIP(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    // may contain multiple IPs: "client, proxy1, proxy2"
    return xff.split(",")[0].trim();
  }
  const ip = req.socket?.remoteAddress || req.ip || "";
  // strip IPv6 prefix like '::ffff:'
  return ip.replace(/^::ffff:/, "");
}

// ---- Routes ----
app.get("/", (_req, res) => res.status(200).send("Campaign Tracker is live"));

app.post("/api/campaign/create", createCampaign);

app.post("/api/track", async (req, res) => {
  try {
    const {
      ref,
      userAgent,
      screenWidth,
      screenHeight,
      language,
      timezone,
    } = req.body;
    console.log(req.body);
    if (!ref) {
      return res.status(400).json({ ok: false, message: "Missing ref code" });
    }

    // Extract visitor IP
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket.remoteAddress;

    // Decode ref back into campaign + campaigner
    const { campaignName, campaignerName } = decode(ref);

    // Find campaign
    const campaign = await LinkCampaignUtm.findOne({
      campaign_name: campaignName,
    });
    if (!campaign) {
      return res
        .status(404)
        .json({ ok: false, message: "Campaign not found" });
    }

    // Find campaigner in campaign
    const source = campaign.utm_source.find(
      (s) => s.utm_source.toLowerCase() === campaignerName.toLowerCase()
    );
    if (!source) {
      return res
        .status(404)
        .json({ ok: false, message: "Campaigner not found" });
    }

    /* ------------------- Log Click (detailed) ------------------- */
    await Click.create({
      link_code: campaign.link_code,
      utm_source: campaignerName,
      utm_campaign: campaignName,
      ip,
      timestamp: new Date(),
      userAgent,
      screenWidth,
      screenHeight,
      language,
      timezone,
    });

    /* ------------------- Update Aggregates ------------------- */
    source.total_clicks += 1;

    if (!source.unique_ips.includes(ip)) {
      source.unique_ips.push(ip);
      source.unique_clicks = source.unique_ips.length;
    }

    await campaign.save();

    return res.json({
      ok: true,
      message: "Click tracked successfully",
      campaignName,
      campaignerName,
      ip,
      total: source.total_clicks,
      unique: source.unique_clicks,
    });
  } catch (err) {
    console.error("Error in tracking:", err);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
});

// Track and (optionally) redirect
app.get("/r/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const doc = await LinkCampaignUtm.findOne({ code });
    if (!doc) return res.status(404).send("Invalid link");

    const ip = getClientIP(req);
    // total clicks increments always
    doc.totalClicks += 1;

    // unique IP logic
    if (!doc.uniqueIPs.includes(ip)) {
      doc.uniqueIPs.push(ip);
      doc.uniqueCount = doc.uniqueIPs.length;
    }
    await doc.save();

    // Simple landing message (you can change to a redirect if you want)
    res.type("html").send(`
      <html>
        <head><title>Thanks for visiting</title></head>
        <body style="font-family: sans-serif; padding: 24px;">
          <h1>Thanks for visiting via ${doc.campaignerName}'s link</h1>
          <p>Campaign: <b>${doc.campaignName}</b></p>
          <p>This IP is counted once. Total unique visitors so far: <b>${doc.uniqueCount}</b></p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Admin report: list all links with counts
app.get("/api/report", async (_req, res) => {
  const rows = await LinkCampaignUtm.find({}, { __v: 0 }).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, rows });
});

// Optional: get report by campaign
app.get("/api/report/:campaignName", async (req, res) => {
  const { campaignName } = req.params;
  const rows = await LinkCampaignUtm.find({ campaignName }, { __v: 0 }).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, rows });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at ${BASE_URL}`);
});
