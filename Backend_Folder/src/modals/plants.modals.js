import mongoose, { Schema } from "mongoose"

const plantSchema = new Schema(
    {
        farmer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        cropeType: {
            type: String,
            required: true
        },
        infectionLevel: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },
        detectedAt: {
            type: Date,
            default: Date.now
        },
    },

    { timestamps: true }
)










export const Plant = mongoose.model("Plant", plantSchemaSchema)