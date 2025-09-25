import mongoose from "mongoose";
import SourceUTM from "./ScourceUTM";

export const LinkCampaignUtmSchema = new mongoose.Schema({
  campaign_name: { type: String, required: true },
  utm_source: { type: [SourceUTM], required: true },
    createdAt: { type: Date, default: Date.now, required : true },
link_code: { type: String, required: true, unique: true }, // short code to identify the link
});