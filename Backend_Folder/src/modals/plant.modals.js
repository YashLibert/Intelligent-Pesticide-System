import mongoose from "mongoose";

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true },        // Example: "Tomato"
  type: { type: String },                        // Example: "Vegetable / Fruit / Crop"
  description: { type: String },
  imageUrl: { type: String },                    // Optional: could link AI classification image
}, { timestamps: true });

export const Plant = mongoose.model("Plant", plantSchema);
