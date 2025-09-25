import mongoose from "mongoose";

// Subdocument schema for campaigners
const CampaignerSchema = new mongoose.Schema({
    id:{ type: String, required: true, unique: true, default: Date.now().toString()},
  name: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now},
  utmHits:{
    source: String,
}
});
export const CampaignersModel = mongoose.model("Campaigners", CampaignerSchema);