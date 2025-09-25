import crypto from "crypto";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = ALPHABET.length;

export function generateStableCode(campaignName, campaignerName) {
  const raw = `${campaignName}:${campaignerName}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return hash.substring(0, 8); // first 8 chars → short but unique enough
}
