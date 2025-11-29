import { analyzePlantDisease } from "../Services/ai.service.js";
import { blockchain, Blockchain } from "../utils/Blockchian.js";
import { BlockRecord } from "../modals/Blockchain.modals.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { SprayEvent } from "../modals/sprayEvent.modals.js";
import { Plant } from "../modals/plant.modals.js";
import { asyncHandler } from "../utils/asynicHandler.js";
import { ApiError } from "../utils/apiError.js";

export const detectAndLogDisease = async(req, res ) => {
    try {

      const {imageUrl, plantID, location} = req.body;
        if(!imageUrl){
            return res.status(400).json({sucess: false, message: "Image URL is Required"});
        }
        // Step 1: Run AI modal\
        const aiResult = await analyzePlantDisease(imageUrl);
        const infectionLevel = aiResult?.[0]?.score || 0.5;
        // Step 2: Create Spray Event
        const event = {
            plantID: plantID || "unknown",
            infectionLevel,
            pesticideAmount: infectionLevel > 0.5 ? 50 : 20,
            recommendedPesticide: "EcoSafe pesticide",
            location: location || "Unknown Location",
        };
        // Step 3 Log to Blockchain
        const newBlock = blockchain.addBlock(event)
        await BlockRecord.create(newBlock)

        return res.json(new ApiResponse(200, {aiResult, event, newBlock}, "AI + Blockchain event logged")); 
    } catch (error) {
      console.error(error)
      return  res.status(500).json({sucess: false, message: "Failed To analyze log "});  
    }
};

export const addPlant = asyncHandler(async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    throw new ApiError(400, "Name and Type are required");
  }

  const plant = await Plant.create({ name, type, farmer: req.user._id });

  return res.status(201).json(new ApiResponse(201, plant, "Plant added successfully"));
});
