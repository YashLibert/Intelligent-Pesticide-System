import mongoose from "mongoose"

const spraySchema = new mongoose.Schema({
    farmerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    plantID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plant",
        required: true
    },
    pesticideAmount: {
        type: Number,
        required: true
    },
    infectionLevel: {
        type: Number,
        required: true  // values between 0-1
    },
    location:{
        type: String
    },
},
    {timestamps: true}
);



export const Spray = mongoose.model("Spray", spraySchema);