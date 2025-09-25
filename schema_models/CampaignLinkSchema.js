import mongoose from "mongoose";

const CampaignLinkSchema = new mongoose.Schema({
  campaignName: { type: String, required: true },
  campaignerName: { type: String, required: true },
  code: { type: String, unique: true, required: true },  // short code
  link: { type: String, required: true },                // tracking URL
  uniqueIPs: { type: [String], default: [] },            // store IPs to dedupe
  uniqueCount: { type: Number, default: 0 },
  totalClicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("CampaignLinks", CampaignLinkSchema);


