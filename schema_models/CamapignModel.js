import mongoose from "mongoose";
import {CampaignersModel} from './CampaignersModel.js';


// Main Campaign schema
const CampaignSchema = new mongoose.Schema({
  campaignID: { type: String, required: true, unique: true, default: `campaign-${Date.now().toString()}`},
  campaigners: [CampaignersModel], // array of campaigners this is used as utm sources..
  campaignName: { type: String, required: true },
  uniqueCode: { type: String, unique: true, required: true }, // 5–6 char code..to map the links with utm ss..
  createdAt: { type: Date, default: Date.now },
  hits: { type: Number, default: 0 },
  utmHits: [{
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
    timestamp: { type: Date, default: Date.now }
  }],
});

export default mongoose.model("Campaigns", CampaignSchema);
