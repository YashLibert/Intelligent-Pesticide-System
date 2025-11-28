import mongoose from "mongoose";

const sprayEventSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plant: { type: mongoose.Schema.Types.ObjectId, ref: "Plant", required: true }, // now it works
  diseaseDetected: { type: String, required: true },
  infectionLevel: { type: Number, min: 0, max: 1 },
  pesticideAmount: { type: Number, required: true },
  compliance: { type: Boolean, default: true },
  rewardTokens: { type: Number, default: 0 },
  blockchainHash: { type: String },
}, { timestamps: true });

export const SprayEvent = mongoose.model("SprayEvent", sprayEventSchema);