// src/models/block.model.js
import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  previousHash: { type: String, required: false },
  hash: { type: String, required: true },
}, {
  timestamps: true,
});

export const BlockRecord = mongoose.model("BlockRecord", blockSchema);
