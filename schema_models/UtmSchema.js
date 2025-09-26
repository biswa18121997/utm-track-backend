// models/CampaignTracker.js
import mongoose from "mongoose";

/* ------------------ Click Schema (detailed log) ------------------ */
const ClickSchema = new mongoose.Schema({
  link_code: { type: String, required: true },
  utm_source: { type: String, required: true },
  utm_campaign: { type: String, required: true },
  ip: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

/* ------------------ SourceUTM Schema (per campaigner summary) ------------------ */
const SourceUTMSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  utm_source: { type: String, required: true },   // campaigner
  utm_campaign: { type: String, required: true }, // campaign
  link_code: { type: String, required: true, unique: true }, // 👈 unique per campaigner
  total_clicks: { type: Number, default: 0 },
  unique_clicks: { type: Number, default: 0 },
  unique_ips: { type: [String], default: [] }, // store unique IPs
});

/* ------------------ LinkCampaign Schema (campaign + campaigners) ------------------ */
const LinkCampaignUtmSchema = new mongoose.Schema({
  campaign_name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  utm_source: { type: [SourceUTMSchema], required: true },
});


/* ------------------ Exports ------------------ */
export const Click = mongoose.models.Click || mongoose.model("Click", ClickSchema);
export const SourceUTM = mongoose.models.SourceUTM || mongoose.model("SourceUTM", SourceUTMSchema);
export const LinkCampaignUtm = mongoose.models.LinkCampaignUtm || mongoose.model("LinkCampaignUtm", LinkCampaignUtmSchema);
