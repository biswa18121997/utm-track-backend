import mongoose from 'mongoose';
export const ClickSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    link_code: { type: String, required: true  },
})

export const SourceUTMSchema = new mongoose.Schema({
    
    createdAt: { type: Date, default: Date.now },
    utm_source: { type: String, required: true },
    // utm_medium: { type: String, required: true },
    utm_campaign: { type: String, required: true },
    total_clicks : { type: Number, default: 0 },
    unique_clicks: { type: Number, default: 0 },
    unique_ips: { type: [String], default: [] }, // to dedupe unique clicks
});

export default async function SourceUTM() {
    
}